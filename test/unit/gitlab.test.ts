import test from 'ava';
import sinon from 'sinon';
import { Factory } from 'fishery';
import { parseISO, subDays, formatISO } from 'date-fns';
import { deletePipeline, filterPipelinesByDate, listPipelines } from '../../src/gitlab';
import { DeleteRequest, GetRequest, Pipeline } from '../../src/network';

interface PipelineTransientParams {
  readonly startDate: Date;
}

const pipelineFactory = Factory.define<Pipeline, PipelineTransientParams>(({ sequence, transientParams }) => {
  let updated_at = '2020-10-01T15:12:52.710Z';
  if (transientParams.startDate !== undefined) {
    updated_at = formatISO(subDays(transientParams.startDate, sequence));
  }
  return {
    id: sequence,
    updated_at,
  };
});

function callListPipelines(getRequest: GetRequest, gitlabUrl = 'https://gitlab.my-domain.io') {
  const projectId = 42;
  const accessToken = 'yBv8';
  const listPipelinesFunction = listPipelines({ getRequest, gitlabUrl, accessToken });
  return listPipelinesFunction(projectId);
}

function callDeletePipeline(deleteRequest: DeleteRequest, gitlabUrl = 'https://gitlab.my-domain.io') {
  const projectId = 42;
  const pipeline: Pipeline = {
    id: 24,
    updated_at: '2020-10-01T20:27:16.768Z',
  };
  const accessToken = 'yBv8';
  const deletePipelineFunction = deletePipeline({ deleteRequest, gitlabUrl, accessToken });
  return deletePipelineFunction(projectId, pipeline);
}

test('listPipelines() creates the correct API URL', async (t) => {
  const getRequest = sinon.fake.resolves([]);
  await callListPipelines(getRequest);

  sinon.assert.calledWith(
    getRequest,
    'https://gitlab.my-domain.io/api/v4/projects/42/pipelines?per_page=100',
    sinon.match.string,
  );
  t.pass();
});

test('listPipelines() creates the correct API URL even when the given GitLab URL has a trailing slash', async (t) => {
  const getRequest = sinon.fake.resolves([]);
  const gitlabUrl = 'https://gitlab.my-domain.io/';
  await callListPipelines(getRequest, gitlabUrl);

  sinon.assert.calledWith(
    getRequest,
    'https://gitlab.my-domain.io/api/v4/projects/42/pipelines?per_page=100',
    sinon.match.string,
  );
  t.pass();
});

test('listPipelines() passes the given access token to getRequest() function', async (t) => {
  const getRequest = sinon.fake.resolves([]);
  await callListPipelines(getRequest);

  sinon.assert.calledWith(getRequest, sinon.match.string, 'yBv8');
  t.pass();
});

test('filterPipelinesByDate() returns an empty Array when pipelines are empty', (t) => {
  const startDate = new Date();
  const olderThanDays = 30;

  const actual = filterPipelinesByDate({ pipelines: [], startDate, olderThanDays });
  const expected: Pipeline[] = [];
  t.deepEqual(actual, expected);
});

test('filterPipelinesByDate() returns only pipelines that are older than 30 days', (t) => {
  const startDate = parseISO('2020-10-01T15:12:52.710Z');
  const olderThanDays = 30;
  pipelineFactory.rewindSequence();
  const pipelines = pipelineFactory.buildList(35, {}, { transient: { startDate } });

  const actual = filterPipelinesByDate({ pipelines, startDate, olderThanDays }).map((pipeline) => pipeline.updated_at);
  const expected = [
    '2020-08-31T17:12:52+02:00',
    '2020-08-30T17:12:52+02:00',
    '2020-08-29T17:12:52+02:00',
    '2020-08-28T17:12:52+02:00',
    '2020-08-27T17:12:52+02:00',
  ];
  t.deepEqual(actual, expected);
});

test('filterPipelinesByDate() returns an empty Array when all pipelines are younger than 30 days', (t) => {
  const startDate = parseISO('2020-10-01T15:12:52.710Z');
  const olderThanDays = 30;
  pipelineFactory.rewindSequence();
  const pipelines = pipelineFactory.buildList(15, {}, { transient: { startDate } });

  const actual = filterPipelinesByDate({ pipelines, startDate, olderThanDays });
  const expected: Pipeline[] = [];
  t.deepEqual(actual, expected);
});

test('deletePipeline() creates the correct API URL', async (t) => {
  const deleteRequest = sinon.fake.resolves('');
  await callDeletePipeline(deleteRequest);

  sinon.assert.calledWith(
    deleteRequest,
    'https://gitlab.my-domain.io/api/v4/projects/42/pipelines/24',
    sinon.match.string,
  );
  t.pass();
});

test('deletePipeline() creates the correct API URL even when the given GitLab URL has a trailing slash', async (t) => {
  const deleteRequest = sinon.fake.resolves('');
  const gitlabUrl = 'https://gitlab.my-domain.io/';
  await callDeletePipeline(deleteRequest, gitlabUrl);

  sinon.assert.calledWith(
    deleteRequest,
    'https://gitlab.my-domain.io/api/v4/projects/42/pipelines/24',
    sinon.match.string,
  );
  t.pass();
});

test('deletePipeline() passes the given access token to deleteRequest() function', async (t) => {
  const deleteRequest = sinon.fake.resolves('');
  await callDeletePipeline(deleteRequest);
  sinon.assert.calledWith(deleteRequest, sinon.match.string, 'yBv8');
  t.pass();
});
