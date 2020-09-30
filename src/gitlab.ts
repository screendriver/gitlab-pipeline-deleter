import { List } from 'list';
import urlcat from 'urlcat';
import { Get, Pipeline } from './network';

export function listPipelines(
  get: Get,
  gitlabUrl: string,
  projectId: number,
  accessToken: string,
): Promise<List<Pipeline>> {
  const url = urlcat(gitlabUrl, '/api/v4/projects/:id/pipelines', { id: projectId });
  return get(url, accessToken);
}
