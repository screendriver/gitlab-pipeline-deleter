#!/usr/bin/env node
import React from 'react';
import { createCommand } from 'commander';
import { render } from 'ink';
import { cosmiconfig } from 'cosmiconfig';
import path from 'path';
import PQueue from 'p-queue';
import { App } from './App';
import { Error } from './Error';
import { getRequest, deleteRequest } from './network';
import { listPipelines, filterPipelinesByDate, deletePipeline } from './gitlab';
import { PartialConfigInput, loadConfig, mergeCliArgumentsWithConfig } from './config';

function exit() {
    process.exitCode = 1;
}

const program = createCommand('gitlab-pipeline-deleter');

program
    .storeOptionsAsProperties(false)
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
            const cliArguments: PartialConfigInput = {
                gitlabUrl: gitlabUrlArgument,
                projectId: projectIdArgument,
                accessToken: accessTokenArgument,
                days: typeof options.days === 'string' ? parseInt(options.days, 10) : 30,
                trace: options.trace === true,
            };
            const configPath = path.resolve(process.cwd(), 'glpd.config.js');
            const explorer = cosmiconfig('gitlab-pipeline-deleter');
            const loadedConfig = await loadConfig(configPath, explorer);
            const glpdArguments = loadedConfig.map((config) => {
                return mergeCliArgumentsWithConfig(cliArguments, config);
            });
            if (glpdArguments.isErr() || !glpdArguments.value.success) {
                render(<Error exit={exit}>Missing or invalid arguments</Error>);
                return;
            }
            const { gitlabUrl, projectIds, accessToken, days, trace } = glpdArguments.value.data;
            const startDate = new Date();
            const listPipelinesFunction = listPipelines({
                getRequest,
                gitlabUrl: gitlabUrl,
                accessToken: accessToken,
            });
            const deletePipelineFunction = deletePipeline({
                deleteRequest,
                gitlabUrl: gitlabUrl,
                accessToken: accessToken,
            });
            const deleteQueue = new PQueue({ autoStart: false, interval: 1000, intervalCap: 10 });
            render(
                <App
                    gitlabUrl={gitlabUrl}
                    projectIds={projectIds}
                    accessToken={accessToken}
                    days={days}
                    startDate={startDate}
                    exit={exit}
                    listPipelines={listPipelinesFunction}
                    filterPipelinesByDate={filterPipelinesByDate}
                    deletePipeline={deletePipelineFunction}
                    deleteQueue={deleteQueue}
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
