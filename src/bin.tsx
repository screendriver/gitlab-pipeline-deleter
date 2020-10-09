#!/usr/bin/env node
import React from 'react';
import { createCommand } from 'commander';
import { render } from 'ink';
import { cosmiconfig } from 'cosmiconfig';
import path from 'path';
import { App } from './App';
import { Error } from './Error';
import { getRequest, deleteRequest } from './network';
import { listPipelines, filterPipelinesByDate, deletePipeline } from './gitlab';
import { CliArguments, loadConfig, mergeCliArgumentsWithConfig } from './config';

function exit() {
  process.exitCode = 1;
}

const program = createCommand('gitlab-pipeline-deleter');

program
  .storeOptionsAsProperties(false)
  .passCommandToAction(false)
  .description('Deletes old GitLab pipelines')
  .arguments('[gitlab-url]')
  .arguments('[project-id]')
  .arguments('[access-token]')
  .option('-d --days <days>', 'older than days', '30')
  .option('--trace', 'show stack traces for errors when possible', false)
  .action(
    async (
      gitlabUrlArgument: string | undefined,
      projectIdArgument: string | undefined,
      accessTokenArgument: string | undefined,
      options: Record<string, unknown>,
    ) => {
      const cliArguments: CliArguments = {
        gitlabUrl: gitlabUrlArgument,
        projectId: projectIdArgument ? parseInt(projectIdArgument, 10) : undefined,
        accessToken: accessTokenArgument,
        days: typeof options.days === 'string' ? parseInt(options.days, 10) : 30,
        trace: options.trace === true,
      };
      const configPath = path.resolve(process.cwd(), 'glpd.config.js');
      const explorer = cosmiconfig('gitlab-pipeline-deleter');
      const config = await loadConfig(configPath, explorer);
      const glpdArguments = mergeCliArgumentsWithConfig(cliArguments, config);
      if (!glpdArguments.success) {
        render(<Error exit={exit}>Missing or invalid arguments</Error>);
        return;
      }
      const { gitlabUrl, projectId, accessToken, days, trace } = glpdArguments.data;
      const startDate = new Date();
      const listPipelinesFunction = listPipelines({
        getRequest,
        gitlabUrl: gitlabUrl,
        projectId: projectId,
        accessToken: accessToken,
      });
      const deletePipelineFunction = deletePipeline({
        deleteRequest,
        gitlabUrl: gitlabUrl,
        projectId: projectId,
        accessToken: accessToken,
      });
      render(
        <App
          gitlabUrl={gitlabUrl}
          projectId={projectId}
          accessToken={accessToken}
          days={days}
          startDate={startDate}
          exit={exit}
          listPipelines={listPipelinesFunction}
          filterPipelinesByDate={filterPipelinesByDate}
          deletePipeline={deletePipelineFunction}
          showStackTraces={trace}
        />,
      );
    },
  );

function crash(error: Error) {
  console.error(error);
  exit();
}

program.parseAsync(process.argv).catch(crash);
