#!/usr/bin/env node
import React from 'react';
import program from 'commander';
import { render } from 'ink';
import { App } from './index';

program
  .name('gitlab-pipeline-deleter')
  .description('Deletes old GitLab pipelines')
  .arguments('<gitlab-url>')
  .arguments('<project-id>')
  .arguments('<access-token>')
  .option('-d --days <days>', 'older than days', '30')
  .action((gitlabUrl: string, projectId: string, accessToken: string) => {
    const days = parseInt(program.days, 10);
    render(<App gitlabUrl={gitlabUrl} projectId={projectId} accessToken={accessToken} days={days} />);
  });

program.parse(process.argv);
