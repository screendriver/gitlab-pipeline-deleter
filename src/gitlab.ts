import * as L from 'list';
import urlcat from 'urlcat';
import { Get, Pipeline } from './network';

interface Arguments {
  get: Get;
  gitlabUrl: string;
  projectId: number;
  accessToken: string;
}

export async function listPipelines({ get, gitlabUrl, projectId, accessToken }: Arguments): Promise<L.List<Pipeline>> {
  const url = urlcat(gitlabUrl, '/api/v4/projects/:id/pipelines', { id: projectId, per_page: 100 });
  const pipelines = await get(url, accessToken);
  return L.from(pipelines);
}
