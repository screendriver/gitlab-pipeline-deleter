import React from 'react';
import test from 'ava';
import { render, cleanup } from 'ink-testing-library';
import { parseISO } from 'date-fns';
import delay from 'delay';
import PQueue from 'p-queue';
import sinon from 'sinon';
import { withGitLabServer } from './gitlabServer.js';
import { App } from '../../src/App.js';
import { deletePipeline, filterPipelinesByDate, listPipelines } from '../../src/gitlab.js';
import { getRequest, deleteRequest } from '../../src/network.js';

test.afterEach(cleanup);

async function waitUntilDeleted(frames: string[]) {
    if (frames.some((frame) => frame.includes('Pipelines deleted'))) {
        return;
    }
    if (frames.some((frame) => frame.includes('error'))) {
        return;
    }
    await delay(10);
    await waitUntilDeleted(frames);
}

function renderApp(gitlabUrl: string) {
    const projectIds = [42];
    const days = 30;
    const accessToken = 'yBv8';
    const startDate = parseISO('2020-10-01T09:08:52.710Z');
    const listPipelinesFunction = listPipelines({ getRequest, gitlabUrl, accessToken });
    const deletePipelineFunction = deletePipeline({
        deleteRequest,
        gitlabUrl,
        accessToken,
    });
    const deleteQueue = new PQueue({ autoStart: false, concurrency: 5 });
    return render(
        <App
            gitlabUrl={gitlabUrl}
            projectIds={projectIds}
            accessToken={accessToken}
            days={days}
            startDate={startDate}
            exit={sinon.fake()}
            listPipelines={listPipelinesFunction}
            filterPipelinesByDate={filterPipelinesByDate}
            deletePipeline={deletePipelineFunction}
            deleteQueue={deleteQueue}
            showStackTraces={false}
        />,
    );
}

test.serial(
    'deletes 4 old pipelines that are older than 30 days',
    withGitLabServer({}, async (t, url) => {
        const { lastFrame, frames } = renderApp(url);
        await waitUntilDeleted(frames);

        const actual = lastFrame();
        const expected =
            '4 pipelines found\nDeleting pipeline with id 32 for project 42\nDeleting pipeline with id 33 for project 42\nDeleting pipeline with id 34 for project 42\nDeleting pipeline with id 35 for project 42\n\u001b[32mPipelines deleted\u001b[39m';

        t.is(actual, expected);
    }),
);

test.serial(
    'fails with the response error message when a GitLab delete request fails',
    withGitLabServer({ failOnDelete: true }, async (t, url) => {
        const { lastFrame, frames } = renderApp(url);
        await waitUntilDeleted(frames);

        const actual = lastFrame();
        const expected =
            "35 pipelines found\nDeleting pipeline with id 36 for project 42\nDeleting pipeline with id 37 for project 42\nDeleting pipeline with id 38 for project 42\nDeleting pipeline with id 39 for project 42\nDeleting pipeline with id 40 for project 42\nDeleting pipeline with id 41 for project 42\n\u001b[31mThere was an error while deleting the pipelines: Response code 418 (I'm a Teapot)\u001b[39m";

        t.is(actual, expected);
    }),
);
