import sinon from 'sinon';
import { listPipelines } from '../../src/gitlab';

suite('gitlab', function () {
  test('listPipelines() creates the correct API URL', async function () {
    const get = sinon.fake();
    const gitlabUrl = 'https://gitlab.my-domain.io';
    const projectId = 42;
    const accessToken = 'yBv8';
    await listPipelines(get, gitlabUrl, projectId, accessToken);
    sinon.assert.calledWithMatch(get, 'https://gitlab.my-domain.io/api/v4/projects/42/pipelines');
  });

  test('listPipelines() creates the correct API URL even when the given GitLab URL has a trailing slash', async function () {
    const get = sinon.fake();
    const gitlabUrl = 'https://gitlab.my-domain.io/';
    const projectId = 42;
    const accessToken = 'yBv8';
    await listPipelines(get, gitlabUrl, projectId, accessToken);
    sinon.assert.calledWithMatch(get, 'https://gitlab.my-domain.io/api/v4/projects/42/pipelines');
  });

  test('listPipelines() passes the given access token to get() function', async function () {
    const get = sinon.fake();
    const gitlabUrl = 'https://gitlab.my-domain.io';
    const projectId = 42;
    const accessToken = 'yBv8';
    await listPipelines(get, gitlabUrl, projectId, accessToken);
    sinon.assert.calledWith(get, sinon.match.string, 'yBv8');
  });
});
