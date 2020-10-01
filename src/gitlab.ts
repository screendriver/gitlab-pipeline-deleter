import * as L from 'list/methods';
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
}: ListPipelinesArguments): Promise<L.List<Pipeline>> {
  const url = urlcat(gitlabUrl, '/api/v4/projects/:id/pipelines', { id: projectId, per_page: 100 });
  const pipelines = await getRequest(url, accessToken);
  return L.from(pipelines);
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
