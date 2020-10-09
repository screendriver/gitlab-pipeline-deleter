import { assert } from 'chai';
import sinon from 'sinon';
import { cosmiconfig } from 'cosmiconfig';
import { define } from 'cooky-cutter';
import { Config, loadConfig } from '../../src/config';

const configFactory = define<Config>({});

function createExplorer(overrides: Partial<ReturnType<typeof cosmiconfig>> = {}): ReturnType<typeof cosmiconfig> {
  return {
    clearCaches: sinon.fake(),
    clearLoadCache: sinon.fake(),
    clearSearchCache: sinon.fake(),
    load: sinon.fake.resolves({}),
    search: sinon.fake(),
    ...overrides,
  };
}

suite('config', function () {
  test('loadConfig() returns undefined when no config exists', async function () {
    const explorer = createExplorer({
      load: sinon.fake.rejects(new Error()),
    });
    const actual = await loadConfig('./not-found.js', explorer);
    const expected = undefined;
    assert.equal(actual, expected);
  });

  test('loadConfig() returns undefined when config is empty', async function () {
    const explorer = createExplorer({
      load: sinon.fake.resolves({
        isEmpty: true,
      }),
    });
    const actual = await loadConfig('./empty-glpdrc.js', explorer);
    const expected = undefined;
    assert.equal(actual, expected);
  });

  test('loadConfig() returns an empty object when config is an empty object', async function () {
    const config = {};
    const explorer = createExplorer({
      load: sinon.fake.resolves({
        isEmpty: false,
        config,
      }),
    });
    const actual = await loadConfig('./empty-glpdrc.js', explorer);
    const expected = config;
    assert.equal(actual, expected);
  });

  test('loadConfig() returns undefined when config has unknown keys', async function () {
    const explorer = createExplorer({
      load: sinon.fake.resolves({
        isEmpty: false,
        config: {
          foo: 'bar',
        },
      }),
    });
    const actual = await loadConfig('./invalid-glpdrc.js', explorer);
    const expected = undefined;
    assert.equal(actual, expected);
  });

  test('loadConfig() returns undefined when gitlabUrl is not an URL', async function () {
    const config = configFactory({
      gitlabUrl: 'not-an-url',
    });
    const explorer = createExplorer({
      load: sinon.fake.resolves({
        isEmpty: false,
        config,
      }),
    });
    const actual = await loadConfig('./invalid-url-glpdrc.js', explorer);
    const expected = undefined;
    assert.equal(actual, expected);
  });

  test('loadConfig() returns a partial config when not all keys are set', async function () {
    const config = configFactory({
      gitlabUrl: 'https://example.com',
      days: 42,
    });
    const explorer = createExplorer({
      load: sinon.fake.resolves({
        isEmpty: false,
        config,
      }),
    });
    const actual = await loadConfig('./partial-glpdrc.js', explorer);
    const expected = config;
    assert.deepEqual(actual, expected);
  });

  test('loadConfig() returns a full config when all keys are set', async function () {
    const config = configFactory({
      gitlabUrl: 'https://example.com',
      projectId: 123,
      accessToken: 'yBo4v',
      days: 42,
      trace: false,
    });
    const explorer = createExplorer({
      load: sinon.fake.resolves({
        isEmpty: false,
        config,
      }),
    });
    const actual = await loadConfig('./glpdrc.js', explorer);
    const expected = config;
    assert.deepEqual(actual, expected);
  });
});
