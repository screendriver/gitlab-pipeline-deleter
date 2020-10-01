import * as L from 'list/methods';
import urlcat from 'urlcat';
import { parseISO, differenceInDays } from 'date-fns';
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

function isOlderThanDays(startDate: Date, pipelineDate: Date, days: number) {
  return differenceInDays(pipelineDate, startDate) > days;
}

export function filterPipelinesByDate(
  pipelines: L.List<Pipeline>,
  startDate: Date,
  olderThanDays: number,
): L.List<Pipeline> {
  return pipelines.filter((pipeline) => {
    const pipelineDate = parseISO(pipeline.updated_at);
    return isOlderThanDays(startDate, pipelineDate, olderThanDays);
  });
}
