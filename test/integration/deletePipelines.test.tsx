import React from 'react';
import { assert } from 'chai';
import { render } from 'ink-testing-library';
import { parseISO } from 'date-fns';
import delay from 'delay';
import { withGitLabServer } from './gitlabServer';
import { Main } from '../../src/Main';
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

function renderMain(gitlabUrl: string) {
  const projectId = 42;
  const days = 30;
  const accessToken = 'yBv8';
  const startDate = parseISO('2020-10-01T09:08:52.710Z');
  const listPipelinesFunction = listPipelines({ getRequest, gitlabUrl, projectId, accessToken });
  const deletePipelineFunction = deletePipeline({
    deleteRequest,
    gitlabUrl,
    projectId,
    accessToken,
  });
  return render(
    <Main
      gitlabUrl={gitlabUrl}
      projectId={projectId}
      accessToken={accessToken}
      days={days}
      startDate={startDate}
      exit={() => (process.exitCode = 1)}
      listPipelines={listPipelinesFunction}
      filterPipelinesByDate={filterPipelinesByDate}
      deletePipeline={deletePipelineFunction}
    />,
  );
}

suite('delete pipelines', function () {
  test(
    'deletes 4 old pipelines that are older than 30 days',
    withGitLabServer(async (url) => {
      const { lastFrame, frames } = renderMain(url);
      await waitUntilDeleted(frames);
      const actual = lastFrame();
      const expected =
        'Deleting pipeline with id 32\nDeleting pipeline with id 33\nDeleting pipeline with id 34\nDeleting pipeline with id 35\n\u001b[32mPipelines deleted\u001b[39m';
      assert.equal(actual, expected);
    }),
  );
});
