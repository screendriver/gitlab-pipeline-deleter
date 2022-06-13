import React, { Fragment, FunctionComponent, useEffect, useState } from 'react';
import { Text, Static } from 'ink';
import Spinner from 'ink-spinner';
import PQueue from 'p-queue';
import type { ListPipelinesFunction, DeletePipelineFunction, FilterPipelinesByDateFunction } from './gitlab';
import { Error, ErrorProps } from './Error';
import { Pipeline } from './network';

export interface AppProps {
    readonly gitlabUrl: string;
    readonly projectIds: readonly number[];
    readonly accessToken: string;
    readonly days: number;
    readonly startDate: Date;
    readonly exit: ErrorProps['exit'];
    readonly listPipelines: ListPipelinesFunction;
    readonly filterPipelinesByDate: FilterPipelinesByDateFunction;
    readonly deletePipeline: DeletePipelineFunction;
    readonly deleteQueue: PQueue;
    readonly showStackTraces: boolean;
}

async function deletePipelinesForProject(projectId: number, props: AppProps, reportProgress: (text: string) => void) {
    const { startDate, days, listPipelines, filterPipelinesByDate, deletePipeline } = props;
    const pipelines = await listPipelines(projectId);
    const oldPipelines = filterPipelinesByDate({ startDate, olderThanDays: days, pipelines });

    return oldPipelines.map((pipeline: Pipeline) => {
        return props.deleteQueue.add(() => {
            reportProgress(`Deleting pipeline with id ${pipeline.id} for project ${projectId}`);
            return deletePipeline(projectId, pipeline);
        });
    });
}

async function deletePipelines(props: AppProps, reportProgress: (text: string) => void) {
    const { deleteQueue } = props;

    try {
        const projectDeletions = props.projectIds.map((projectId) => {
            return deletePipelinesForProject(projectId, props, reportProgress);
        });
        const deleteTasks = await Promise.all(projectDeletions);
        const { deleteQueue } = props;
        reportProgress(`${deleteQueue.size} pipelines found`);
        deleteQueue.start();

        await Promise.all(deleteTasks.flat());

        return deleteQueue.onIdle();
    } catch (error: unknown) {
        deleteQueue.clear();
        throw error;
    }
}

export const App: FunctionComponent<AppProps> = (props) => {
    const [deleteProgress, setDeleteProgress] = useState(['']);
    const [isDone, setDone] = useState(false);
    const [deletePipelinesError, setDeletePipelinesError] = useState<Error>();

    useEffect(() => {
        deletePipelines(props, (text) => {
            setDeleteProgress((currentDeleteProgress) => [...currentDeleteProgress, text]);
        })
            .then(() => {
                setDone(true);
            })
            .catch(setDeletePipelinesError);
    }, [props]);

    if (deletePipelinesError !== undefined) {
        const message = props.showStackTraces ? deletePipelinesError.stack : deletePipelinesError.message;
        return <Error exit={props.exit}>There was an error while deleting the pipelines: {message}</Error>;
    }

    return (
        <Fragment>
            <Static items={deleteProgress}>{(text) => <Text key={text}>{text}</Text>}</Static>
            <Text>
                {!isDone && <Spinner />}
                {isDone && <Text color="green">Pipelines deleted</Text>}
            </Text>
        </Fragment>
    );
};
