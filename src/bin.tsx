#!/usr/bin/env node
import React from 'react';
import { createCommand } from 'commander';
import { render } from 'ink';
import { Main } from './Main';
import { getRequest, deleteRequest } from './network';
import { listPipelines, filterPipelinesByDate, deletePipeline } from './gitlab';

function exit() {
  process.exitCode = 1;
}

const program = createCommand('gitlab-pipeline-deleter');

program
  .storeOptionsAsProperties(false)
  .passCommandToAction(false)
  .description('Deletes old GitLab pipelines')
  .arguments('<gitlab-url>')
  .arguments('<project-id>')
  .arguments('<access-token>')
  .option('-d --days <days>', 'older than days', '30')
  .option('--trace', 'show stack traces for errors when possible', false)
  .action((gitlabUrl: string, projectId: string, accessToken: string, options: Record<string, unknown>) => {
    const parsedProjectId = parseInt(projectId, 10);
    const days = typeof options.days === 'string' ? parseInt(options.days, 10) : 30;
    const startDate = new Date();
    const listPipelinesFunction = listPipelines({ getRequest, gitlabUrl, projectId: parsedProjectId, accessToken });
    const deletePipelineFunction = deletePipeline({
      deleteRequest,
      gitlabUrl,
      projectId: parsedProjectId,
      accessToken,
    });
    render(
      <Main
        gitlabUrl={gitlabUrl}
        projectId={parsedProjectId}
        accessToken={accessToken}
        days={days}
        startDate={startDate}
        exit={exit}
        listPipelines={listPipelinesFunction}
        filterPipelinesByDate={filterPipelinesByDate}
        deletePipeline={deletePipelineFunction}
        showStackTraces={options.trace === true}
      />,
    );
  });

program.parse(process.argv);
