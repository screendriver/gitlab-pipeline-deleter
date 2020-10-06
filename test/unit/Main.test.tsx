import React from 'react';
import { assert } from 'chai';
import { render } from 'ink-testing-library';
import delay from 'delay';
import { Main, MainProps } from '../../src/Main';
import { createAppProps } from './factory';

function renderMain(overrides: Partial<MainProps> = {}) {
  const props = createAppProps(overrides);
  return render(
    <Main
      projectId={props.projectId}
      gitlabUrl={props.gitlabUrl}
      days={props.days}
      accessToken={props.accessToken}
      exit={props.exit}
      startDate={props.startDate}
      filterPipelinesByDate={props.filterPipelinesByDate}
      listPipelines={props.listPipelines}
      deletePipeline={props.deletePipeline}
    />,
  );
}

suite('<Main />', function () {
  test('renders an error when projectId is not a number', async function () {
    const { lastFrame } = renderMain({ projectId: NaN });
    await delay(1);
    const actual = lastFrame();
    const expected = '\u001b[31mGiven project id is not a number\u001b[39m';
    assert.equal(actual, expected);
  });

  test('renders an error when days is not a number', function () {
    const { lastFrame } = renderMain({ days: NaN });
    const actual = lastFrame();
    const expected = '\u001b[31mGiven days is not a number\u001b[39m';
    assert.equal(actual, expected);
  });
});
