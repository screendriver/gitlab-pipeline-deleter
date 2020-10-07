import React, { FunctionComponent, useEffect, useState } from 'react';
import { Text, Static } from 'ink';
import Spinner from 'ink-spinner';
import pMap from 'p-map';
import type { ListPipelinesFunction, DeletePipelineFunction, FilterPipelinesByDateFunction } from './gitlab';
import { Error, ErrorProps } from './Error';

export interface AppProps {
  gitlabUrl: string;
  projectId: number;
  accessToken: string;
  days: number;
  startDate: Date;
  exit: ErrorProps['exit'];
  listPipelines: ListPipelinesFunction;
  filterPipelinesByDate: FilterPipelinesByDateFunction;
  deletePipeline: DeletePipelineFunction;
  showStackTraces: boolean;
}

async function deletePipelines(
  { startDate, days, listPipelines, filterPipelinesByDate, deletePipeline }: AppProps,
  reportProgress: (text: string) => void,
) {
  const pipelines = await listPipelines();
  const oldPipelines = filterPipelinesByDate({ startDate, olderThanDays: days, pipelines });
  return pMap(
    oldPipelines,
    (pipeline) => {
      reportProgress(`Deleting pipeline with id ${pipeline.id}`);
      return deletePipeline(pipeline);
    },
    {
      concurrency: 20,
    },
  );
}

export const App: FunctionComponent<AppProps> = (props) => {
  const [deleteProgress, setDeleteProgress] = useState(['']);
  const [isDone, setDone] = useState(false);
  const [deletePipelinesError, setDeletePipelinesError] = useState<Error>();
  useEffect(() => {
    deletePipelines(props, (text) => setDeleteProgress((currentDeleteProgress) => [...currentDeleteProgress, text]))
      .then(() => setDone(true))
      .catch((error) => setDeletePipelinesError(error));
  }, [props]);
  if (deletePipelinesError) {
    const message = props.showStackTraces ? deletePipelinesError.stack : deletePipelinesError.message;
    return <Error exit={props.exit}>There was an error while deleting the pipelines: {message}</Error>;
  }
  return (
    <>
      <Static items={deleteProgress}>{(text) => <Text key={text}>{text}</Text>}</Static>
      <Text>
        {!isDone && <Spinner />}
        {isDone && <Text color="green">Pipelines deleted</Text>}
      </Text>
    </>
  );
};
