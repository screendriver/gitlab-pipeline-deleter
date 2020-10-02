import urlcat from 'urlcat';
import { parseISO, differenceInDays } from 'date-fns';
import { GetRequest, DeleteRequest, Pipeline } from './network';

interface ListPipelinesArguments {
  getRequest: GetRequest;
  gitlabUrl: string;
  projectId: number;
  accessToken: string;
}

export async function listPipelines({
  getRequest,
  gitlabUrl,
  projectId,
  accessToken,
}: ListPipelinesArguments): Promise<readonly Pipeline[]> {
  const url = urlcat(gitlabUrl, '/api/v4/projects/:id/pipelines', { id: projectId, per_page: 100 });
  return getRequest(url, accessToken);
}

interface DeletePipelineArguments {
  deleteRequest: DeleteRequest;
  gitlabUrl: string;
  projectId: number;
  pipeline: Pipeline;
  accessToken: string;
}

export async function deletePipeline({
  deleteRequest,
  gitlabUrl,
  projectId,
  pipeline,
  accessToken,
}: DeletePipelineArguments): Promise<void> {
  const url = urlcat(gitlabUrl, '/api/v4/projects/:id/pipelines/:pipeline_id', {
    id: projectId,
    pipeline_id: pipeline.id,
  });
  await deleteRequest(url, accessToken);
}

function isOlderThanDays(startDate: Date, pipelineDate: Date, days: number) {
  return differenceInDays(pipelineDate, startDate) > days;
}

interface FilterPipelinesByDateArguments {
  pipelines: readonly Pipeline[];
  startDate: Date;
  olderThanDays: number;
}

export function filterPipelinesByDate({
  pipelines,
  startDate,
  olderThanDays,
}: FilterPipelinesByDateArguments): readonly Pipeline[] {
  return pipelines.filter((pipeline) => {
    const pipelineDate = parseISO(pipeline.updated_at);
    return isOlderThanDays(startDate, pipelineDate, olderThanDays);
  });
}
