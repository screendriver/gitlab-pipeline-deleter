import React from 'react';
import { assert } from 'chai';
import { render } from 'ink-testing-library';
import { parseISO } from 'date-fns';
import delay from 'delay';
import PQueue from 'p-queue';
import { withGitLabServer } from './gitlabServer';
import { App } from '../../src/App';
import { deletePipeline, filterPipelinesByDate, listPipelines } from '../../src/gitlab';
import { getRequest, deleteRequest } from '../../src/network';

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
      exit={() => (process.exitCode = 1)}
      listPipelines={listPipelinesFunction}
      filterPipelinesByDate={filterPipelinesByDate}
      deletePipeline={deletePipelineFunction}
      deleteQueue={deleteQueue}
      showStackTraces={false}
    />,
  );
}

suite('delete pipelines', function () {
  test(
    'deletes 4 old pipelines that are older than 30 days',
    withGitLabServer({}, async (url) => {
      const { lastFrame, frames } = renderApp(url);
      await waitUntilDeleted(frames);
      const actual = lastFrame();
      const expected =
        'Deleting pipeline with id 32 for project 42\nDeleting pipeline with id 33 for project 42\nDeleting pipeline with id 34 for project 42\nDeleting pipeline with id 35 for project 42\n\u001b[32mPipelines deleted\u001b[39m';
      assert.equal(actual, expected);
    }),
  );

  test(
    'fails with the response error message when a GitLab delete request fails',
    withGitLabServer({ failOnDelete: true }, async (url) => {
      const { lastFrame, frames } = renderApp(url);
      await waitUntilDeleted(frames);
      const actual = lastFrame();
      const expected =
        "Deleting pipeline with id 36 for project 42\nDeleting pipeline with id 37 for project 42\nDeleting pipeline with id 38 for project 42\nDeleting pipeline with id 39 for project 42\nDeleting pipeline with id 40 for project 42\nDeleting pipeline with id 41 for project 42\n\u001b[31mThere was an error while deleting the pipelines: Response code 418 (I'm a Teapot)\u001b[39m";
      assert.equal(actual, expected);
    }),
  );
});
