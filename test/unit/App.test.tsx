import React from 'react';
import test from 'ava';
import { render, cleanup } from 'ink-testing-library';
import sinon from 'sinon';
import delay from 'delay';
import { Factory } from 'fishery';
import { App, AppProps } from '../../source/App.js';
import { Pipeline } from '../../source/network.js';
import { createAppProps } from './factory.js';

test.afterEach(cleanup);

const pipelineFactory = Factory.define<Pipeline>(({ sequence }) => {
    return {
        id: sequence,
        updated_at: '',
    };
});

function renderApp(overrides: Partial<AppProps> = {}) {
    const props = createAppProps(overrides);
    return render(
        <App
            gitlabUrl={props.gitlabUrl}
            accessToken={props.accessToken}
            projectIds={props.projectIds}
            startDate={props.startDate}
            days={props.days}
            listPipelines={props.listPipelines}
            deletePipeline={props.deletePipeline}
            filterPipelinesByDate={props.filterPipelinesByDate}
            deleteQueue={props.deleteQueue}
            exit={props.exit}
            showStackTraces={props.showStackTraces}
        />,
    );
}

test.serial('renders initially a loading spinner', async (t) => {
    const { frames } = renderApp();
    await delay(1);

    const actual = frames[0];
    const expected = '⠋';

    t.is(actual, expected);
});

test.serial('shows how many pipelines are found in the beginning', async (t) => {
    const { lastFrame } = renderApp();
    await delay(1);

    const actual = lastFrame()?.startsWith('0 pipelines found\n');

    t.true(actual);
});

test.serial("shows the success message 'Pipelines deleted' when deletion is finished", async (t) => {
    const { lastFrame } = renderApp();
    await delay(1);

    const actual = lastFrame()?.endsWith('\u001b[32mPipelines deleted\u001b[39m');

    t.true(actual);
});

test.serial('shows the delete progress while it deletes the pipelines', async (t) => {
    const pipelines = pipelineFactory.buildList(5);
    const { lastFrame } = renderApp({
        filterPipelinesByDate: sinon.fake.returns(pipelines),
    });
    await delay(1000);

    const actual = lastFrame();
    const expected =
        '5 pipelines found\nDeleting pipeline with id 1 for project 42\nDeleting pipeline with id 2 for project 42\nDeleting pipeline with id 3 for project 42\nDeleting pipeline with id 4 for project 42\nDeleting pipeline with id 5 for project 42\n\u001b[32mPipelines deleted\u001b[39m';

    t.is(actual, expected);
});

test.serial('deletes pipelines of multiple projects', async (t) => {
    const { lastFrame } = renderApp({
        filterPipelinesByDate: sinon
            .stub()
            .onFirstCall()
            .returns(pipelineFactory.buildList(1))
            .onSecondCall()
            .returns([])
            .onThirdCall()
            .returns(pipelineFactory.buildList(2)),
        projectIds: [1, 2, 3],
    });
    await delay(1000);

    const actual = lastFrame();
    const expected =
        '3 pipelines found\nDeleting pipeline with id 6 for project 1\nDeleting pipeline with id 7 for project 3\nDeleting pipeline with id 8 for project 3\n\u001b[32mPipelines deleted\u001b[39m';

    t.is(actual, expected);
});

test.serial('renders an error message when an error occurred', async (t) => {
    const { lastFrame } = renderApp({
        listPipelines: sinon.fake.rejects(new Error('Test Error')),
    });
    await delay(1);

    const actual = lastFrame();
    const expected = '\u001b[31mThere was an error while deleting the pipelines: Test Error\u001b[39m';

    t.is(actual, expected);
});

test.serial('renders an error message when a delete request fails', async (t) => {
    const pipelines = pipelineFactory.buildList(1);
    const { lastFrame } = renderApp({
        filterPipelinesByDate: sinon.fake.returns(pipelines),
        deletePipeline: sinon.fake.rejects(new Error('Failed to delete')),
    });
    await delay(1000);

    const actual = lastFrame();
    const expected =
        '1 pipelines found\nDeleting pipeline with id 9 for project 42\n\u001b[31mThere was an error while deleting the pipelines: Failed to delete\u001b[39m';

    t.is(actual, expected);
});

test.serial(
    'renders an error message with stack trace when an error occurred and showStackTraces is true',
    async (t) => {
        const error = new Error('Test Error');
        error.stack = 'the-stack-trace';
        const { lastFrame } = renderApp({
            listPipelines: sinon.fake.rejects(error),
            showStackTraces: true,
        });
        await delay(1);

        const actual = lastFrame();
        const expected = '\u001b[31mThere was an error while deleting the pipelines: the-stack-trace\u001b[39m';

        t.is(actual, expected);
    },
);
