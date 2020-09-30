import { assert } from 'chai';
import sinon from 'sinon';
import * as L from 'list';
import { listPipelines } from '../../src/gitlab';
import { Get } from '../../src/network';

function callListPipelines(get: Get, gitlabUrl = 'https://gitlab.my-domain.io') {
  const projectId = 42;
  const accessToken = 'yBv8';
  return listPipelines({ get, gitlabUrl, projectId, accessToken });
}

suite('gitlab', function () {
  test('listPipelines() creates the correct API URL', async function () {
    const get = sinon.fake.resolves([]);
    await callListPipelines(get);
    sinon.assert.calledWith(
      get,
      'https://gitlab.my-domain.io/api/v4/projects/42/pipelines?per_page=100',
      sinon.match.string,
    );
  });

  test('listPipelines() creates the correct API URL even when the given GitLab URL has a trailing slash', async function () {
    const get = sinon.fake.resolves([]);
    const gitlabUrl = 'https://gitlab.my-domain.io/';
    await callListPipelines(get, gitlabUrl);
    sinon.assert.calledWith(
      get,
      'https://gitlab.my-domain.io/api/v4/projects/42/pipelines?per_page=100',
      sinon.match.string,
    );
  });

  test('listPipelines() passes the given access token to get() function', async function () {
    const get = sinon.fake.resolves([]);
    await callListPipelines(get);
    sinon.assert.calledWith(get, sinon.match.string, 'yBv8');
  });

  test('listPipelines() returns an immutable list', async function () {
    const get = sinon.fake.resolves([]);
    const pipelines = await callListPipelines(get);
    const actual = L.isList(pipelines);
    const expected = true;
    assert.equal(actual, expected);
  });
});
