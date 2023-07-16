import createFastify from 'fastify';
import type { RouteOptions } from 'fastify';
import { Factory } from 'fishery';
import { subDays, formatISO, parseISO } from 'date-fns';
import { IncomingHttpHeaders } from 'http';
import { Pipeline } from '../../src/network.js';
import type { ExecutionContext, ImplementationFn } from 'ava';

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

function createRoutes(config: Config): RouteOptions[] {
    const { failOnDelete = false } = config;

    return [
        {
            async handler(request, reply) {
                if (!isHeaderValid(request.headers)) {
                    return reply.status(404).send('404 Project Not Found');
                }
                const startDate = parseISO('2020-10-01T15:12:52.710Z');
                const pipelines = pipelineFactory.buildList(35, {}, { transient: { startDate } });

                return reply.status(200).send(pipelines);
            },
            method: 'GET',
            url: '/api/v4/projects/:id/pipelines',
        },
        {
            async handler(request, reply) {
                if (!isHeaderValid(request.headers)) {
                    return reply.status(404).send('404 Project Not Found');
                }

                if (failOnDelete) {
                    return reply.status(418).send('I’m a teapot');
                }

                return reply.status(200).send('');
            },
            method: 'DELETE',
            url: '/api/v4/projects/:id/pipelines/:pipeline_id',
        },
    ];
}

export function withGitLabServer(
    config: Config,
    test: (t: ExecutionContext<unknown>, url: string) => void | Promise<void>,
): ImplementationFn<[]> {
    return async (t) => {
        const server = createFastify({ logger: false });

        try {
            const routes = createRoutes(config);
            routes.forEach((routeOptions) => {
                server.route(routeOptions);
            });

            const listeningAddress = await server.listen({ port: 3000 });

            await test(t, listeningAddress);
        } finally {
            await server.close();
        }
    };
}
