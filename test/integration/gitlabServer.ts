import micro, { RequestHandler, send } from 'micro';
import { router, get, del } from 'microrouter';
import listen from 'test-listen';
import Mocha from 'mocha';
import { define, sequence, array } from 'cooky-cutter';
import { subDays, formatISO, parseISO } from 'date-fns';
import { IncomingHttpHeaders } from 'http';
import { Pipeline } from '../../src/network';

const pipeline = define<Pipeline>({
  id: sequence,
  updated_at: '2020-10-05T20:27:16.768Z',
});

function isHeaderValid(headers: IncomingHttpHeaders) {
  return headers['private-token'] === 'yBv8';
}

function createRoutes(): RequestHandler[] {
  return [
    get('/api/v4/projects/:id/pipelines', async (request, response) => {
      if (!isHeaderValid(request.headers)) {
        await send(response, 404, { message: '404 Project Not Found' });
        return;
      }
      const startDate = parseISO('2020-10-01T15:12:52.710Z');
      const pipelinesFactory = array(pipeline, 35);
      await send(
        response,
        200,
        pipelinesFactory({
          updated_at: (index: number) => formatISO(subDays(startDate, index)),
        }),
      );
    }),
    del('/api/v4/projects/:id/pipelines/:pipeline_id', async (request, response) => {
      if (!isHeaderValid(request.headers)) {
        await send(response, 404, { message: '404 Project Not Found' });
        return;
      }
      await send(response, 200, '');
    }),
  ];
}

export function withGitLabServer(test: (url: string) => void | Promise<void>): Mocha.Func {
  return async () => {
    const routes = createRoutes();
    const server = micro(router(...routes));
    try {
      const url = await listen(server);
      await test(url);
    } finally {
      server.close();
    }
  };
}
