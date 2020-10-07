import React, { FunctionComponent } from 'react';
import { App, AppProps } from './App';
import { Error } from './Error';

export type MainProps = AppProps;

export const Main: FunctionComponent<MainProps> = (props) => {
  if (isNaN(props.projectId)) {
    return <Error exit={props.exit}>Given project id is not a number</Error>;
  }
  if (isNaN(props.days)) {
    return <Error exit={props.exit}>Given days is not a number</Error>;
  }
  return (
    <App
      gitlabUrl={props.gitlabUrl}
      projectId={props.projectId}
      accessToken={props.accessToken}
      days={props.days}
      startDate={props.startDate}
      exit={props.exit}
      listPipelines={props.listPipelines}
      filterPipelinesByDate={props.filterPipelinesByDate}
      deletePipeline={props.deletePipeline}
      showStackTraces={props.showStackTraces}
    />
  );
};
