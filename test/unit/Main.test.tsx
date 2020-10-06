import React from 'react';
import { assert } from 'chai';
import { render } from 'ink-testing-library';
import sinon from 'sinon';
import delay from 'delay';
import { Main, MainProps } from '../../src/Main';

function renderMain(overrides: Partial<MainProps> = {}) {
  const props: MainProps = {
    gitlabUrl: 'https://gitlab.my-domain.io',
    projectId: 42,
    accessToken: 'yBo4v',
    days: 30,
    startDate: new Date(),
    exit: sinon.fake(),
    listPipelines: sinon.fake.resolves([]),
    filterPipelinesByDate: sinon.fake.returns([]),
    deletePipeline: sinon.fake.resolves(undefined),
    ...overrides,
  };
  return render(
    <Main
      gitlabUrl={props.gitlabUrl}
      projectId={props.projectId}
      accessToken={props.accessToken}
      days={props.days}
      startDate={props.startDate}
      exit={props.exit}
      listPipelines={props.listPipelines}
      filterPipelinesByDate={props.filterPipelinesByDate}
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
