import micro, { RequestHandler, send } from 'micro';
import { router, get, del } from 'microrouter';
import listen from 'test-listen';
import { Factory } from 'fishery';
import { subDays, formatISO, parseISO } from 'date-fns';
import { IncomingHttpHeaders } from 'http';
import { Pipeline } from '../../src/network';
import { ExecutionContext, ImplementationFn } from 'ava';

interface PipelineTransientParams {
    readonly startDate: Date;
}

const pipelineFactory = Factory.define<Pipeline, PipelineTransientParams>(({ sequence, transientParams }) => {
    let updated_at = '2020-10-05T20:27:16.768Z';
    if (transientParams.startDate !== undefined) {
        updated_at = formatISO(subDays(transientParams.startDate, sequence));
    }
    return {
        id: sequence,
        updated_at,
    };
});

function isHeaderValid(headers: IncomingHttpHeaders) {
    return headers['private-token'] === 'yBv8';
}

interface Config {
    failOnDelete?: boolean;
}

function createRoutes(config: Config): RequestHandler[] {
    const { failOnDelete = false } = config;

    return [
        get('/api/v4/projects/:id/pipelines', async (request, response) => {
            if (!isHeaderValid(request.headers)) {
                await send(response, 404, { message: '404 Project Not Found' });
                return;
            }
            const startDate = parseISO('2020-10-01T15:12:52.710Z');
            const pipelines = pipelineFactory.buildList(35, {}, { transient: { startDate } });
            await send(response, 200, pipelines);
        }),
        del('/api/v4/projects/:id/pipelines/:pipeline_id', async (request, response) => {
            if (!isHeaderValid(request.headers)) {
                await send(response, 404, { message: '404 Project Not Found' });
                return;
            }

            if (failOnDelete) {
                await send(response, 418, { message: 'I’m a teapot' });
                return;
            }

            await send(response, 200, '');
        }),
    ];
}

export function withGitLabServer(
    config: Config,
    test: (t: ExecutionContext<unknown>, url: string) => void | Promise<void>,
): ImplementationFn<[]> {
    return async (t) => {
        const routes = createRoutes(config);
        const server = micro(router(...routes));
        try {
            const url = await listen(server);

            await test(t, url);
        } finally {
            server.close();
        }
    };
}
