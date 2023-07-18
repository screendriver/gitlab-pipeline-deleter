import { URL } from 'node:url';
import { parseISO, differenceInDays } from 'date-fns';
import { GetRequest, DeleteRequest, Pipeline } from './network.js';

interface ListPipelinesArguments {
    readonly getRequest: GetRequest;
    readonly gitlabUrl: string;
    readonly accessToken: string;
}

export type ListPipelinesFunction = (projectId: number) => Promise<readonly Pipeline[]>;

export function listPipelines({ getRequest, gitlabUrl, accessToken }: ListPipelinesArguments): ListPipelinesFunction {
    return (projectId) => {
        const escapedProjectId = encodeURIComponent(projectId);
        const url = new URL(`/api/v4/projects/${escapedProjectId}/pipelines`, gitlabUrl);

        url.searchParams.set('per_page', '100');

        return getRequest(url.toString(), accessToken);
    };
}

interface DeletePipelineArguments {
    readonly deleteRequest: DeleteRequest;
    readonly gitlabUrl: string;
    readonly accessToken: string;
}

export type DeletePipelineFunction = (projectId: number, pipeline: Pipeline) => Promise<void>;

export function deletePipeline({
    deleteRequest,
    gitlabUrl,
    accessToken,
}: DeletePipelineArguments): DeletePipelineFunction {
    return async (projectId, pipeline) => {
        const escapedProjectId = encodeURIComponent(projectId);
        const escapedPipelineId = encodeURIComponent(pipeline.id);
        const url = new URL(`/api/v4/projects/${escapedProjectId}/pipelines/${escapedPipelineId}`, gitlabUrl);

        await deleteRequest(url.toString(), accessToken);
    };
}

function isOlderThanDays(startDate: Date, pipelineDate: Date, days: number) {
    return differenceInDays(startDate, pipelineDate) > days;
}

interface FilterPipelinesByDateArguments {
    readonly pipelines: readonly Pipeline[];
    readonly startDate: Date;
    readonly olderThanDays: number;
}

export type FilterPipelinesByDateFunction = ({
    pipelines,
    startDate,
    olderThanDays,
}: FilterPipelinesByDateArguments) => readonly Pipeline[];

export const filterPipelinesByDate: FilterPipelinesByDateFunction = ({ pipelines, startDate, olderThanDays }) => {
    return pipelines.filter((pipeline) => {
        const pipelineDate = parseISO(pipeline.updated_at);

        return isOlderThanDays(startDate, pipelineDate, olderThanDays);
    });
};
