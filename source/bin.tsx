#!/usr/bin/env node
import React from 'react';
import { createCommand } from 'commander';
import { render } from 'ink';
import { cosmiconfig } from 'cosmiconfig';
import path from 'node:path';
import PQueue from 'p-queue';
import { App } from './App.js';
import { Error } from './Error.js';
import { deleteRequest, getRequest } from './network.js';
import { deletePipeline, filterPipelinesByDate, listPipelines } from './gitlab.js';
import { baseConfigSchema, loadConfig, mergeCliArgumentsWithConfig, PartialConfigInput } from './config.js';
import is from '@sindresorhus/is';

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
    .option('-d --days <days>', `older than days  (default: "${baseConfigSchema.shape.days._def.defaultValue()}")`)
    .option(
        '--trace',
        `show stack traces for errors when possible (default: ${baseConfigSchema.shape.trace._def.defaultValue()})`,
    )
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
                days: is.string(options.days) ? parseInt(options.days, 10) : undefined,
                trace: is.boolean(options.trace) ? options.trace : undefined,
            };
            const configPath = path.resolve(process.cwd(), 'glpd.config.js');
            const explorer = cosmiconfig('gitlab-pipeline-deleter');
            const loadedConfig = await loadConfig(configPath, explorer);
            const glpdArguments = loadedConfig.andThen((config) => {
                return mergeCliArgumentsWithConfig(cliArguments, config);
            });

            if (glpdArguments.isErr) {
                render(<Error exit={exit}>Missing or invalid arguments</Error>);
                return;
            }

            const { gitlabUrl, projectIds, accessToken, days, trace } = glpdArguments.value;
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
