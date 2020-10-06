import React from 'react';
import { render } from 'ink-testing-library';
import sinon from 'sinon';
import { assert } from 'chai';
import delay from 'delay';
import { define, sequence, array } from 'cooky-cutter';
import { App, AppProps } from '../../src/App';
import { Pipeline } from '../../src/network';
import { createAppProps } from './factory';

const pipeline = define<Pipeline>({
  id: sequence,
  updated_at: '',
});

function renderApp(overrides: Partial<AppProps> = {}) {
  const props = createAppProps(overrides);
  return render(
    <App
      gitlabUrl={props.gitlabUrl}
      accessToken={props.accessToken}
      projectId={props.projectId}
      startDate={props.startDate}
      days={props.days}
      listPipelines={props.listPipelines}
      deletePipeline={props.deletePipeline}
      filterPipelinesByDate={props.filterPipelinesByDate}
      exit={props.exit}
    />,
  );
}

suite('<App />', function () {
  test('renders initially a loading spinner', function () {
    const { lastFrame } = renderApp();
    const actual = lastFrame();
    const expected = '⠋';
    assert.equal(actual, expected);
  });

  test("shows the success message 'Pipelines deleted' when deletion is finished", async function () {
    const { lastFrame } = renderApp();
    await delay(1);
    const actual = lastFrame();
    const expected = '\u001b[32mPipelines deleted\u001b[39m';
    assert.equal(actual, expected);
  });

  test('shows the delete progress while it deletes the pipelines', async function () {
    const pipelinesFactory = array(pipeline, 5);
    const pipelines = pipelinesFactory();
    const { lastFrame } = renderApp({
      filterPipelinesByDate: sinon.fake.returns(pipelines),
    });
    await delay(1);
    const actual = lastFrame();
    const expected =
      'Deleting pipeline with id 1\nDeleting pipeline with id 2\nDeleting pipeline with id 3\nDeleting pipeline with id 4\nDeleting pipeline with id 5\n\u001b[32mPipelines deleted\u001b[39m';
    assert.equal(actual, expected);
  });

  test('renders an error message when an error occurred', async function () {
    const { lastFrame } = renderApp({
      listPipelines: sinon.fake.rejects(new Error('Test Error')),
    });
    await delay(1);
    const actual = lastFrame();
    const expected = '\u001b[31mThere was an error while deleting the pipelines: Test Error\u001b[39m';
    assert.equal(actual, expected);
  });
});
