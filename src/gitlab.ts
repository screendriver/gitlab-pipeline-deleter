import urlcat from 'urlcat';
import { parseISO, differenceInDays } from 'date-fns';
import { GetRequest, DeleteRequest, Pipeline } from './network';

interface ListPipelinesArguments {
    readonly getRequest: GetRequest;
    readonly gitlabUrl: string;
    readonly accessToken: string;
}

export type ListPipelinesFunction = (projectId: number) => Promise<readonly Pipeline[]>;

export function listPipelines({ getRequest, gitlabUrl, accessToken }: ListPipelinesArguments): ListPipelinesFunction {
    return (projectId) => {
        const url = urlcat(gitlabUrl, '/api/v4/projects/:id/pipelines', { id: projectId, per_page: 100 });

        return getRequest(url, accessToken);
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
        const url = urlcat(gitlabUrl, '/api/v4/projects/:id/pipelines/:pipeline_id', {
            id: projectId,
            pipeline_id: pipeline.id,
        });

        await deleteRequest(url, accessToken);
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
