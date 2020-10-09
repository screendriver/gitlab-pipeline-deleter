import { assert } from 'chai';
import sinon from 'sinon';
import { cosmiconfig } from 'cosmiconfig';
import { define } from 'cooky-cutter';
import { CliArguments, Config, loadConfig, mergeCliArgumentsWithConfig } from '../../src/config';

const configFactory = define<Config>({
  gitlabUrl: 'https://example.com',
  projectId: 42,
  accessToken: 'yBo4v',
  days: 30,
  trace: false,
});

const cliArgumentsFactory = define<CliArguments>({
  gitlabUrl: 'https://example.com',
  projectId: 42,
  accessToken: 'yBo4v',
  days: 30,
  trace: false,
});

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
      projectId: undefined,
      accessToken: undefined,
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
    const config = configFactory();
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

  test('mergeCliArgumentsWithConfig() returns no success when gitlabUrl was not set', function () {
    const config = configFactory({ gitlabUrl: undefined });
    const cliArguments = cliArgumentsFactory({ gitlabUrl: undefined });
    const actual = mergeCliArgumentsWithConfig(cliArguments, config).success;
    const expected = false;
    assert.equal(actual, expected);
  });

  test('mergeCliArgumentsWithConfig() returns no success when projectId was not set', function () {
    const config = configFactory({ projectId: undefined });
    const cliArguments = cliArgumentsFactory({ projectId: undefined });
    const actual = mergeCliArgumentsWithConfig(cliArguments, config).success;
    const expected = false;
    assert.equal(actual, expected);
  });

  test('mergeCliArgumentsWithConfig() returns no success when accessToken was not set', function () {
    const config = configFactory({ accessToken: undefined });
    const cliArguments = cliArgumentsFactory({ accessToken: undefined });
    const actual = mergeCliArgumentsWithConfig(cliArguments, config).success;
    const expected = false;
    assert.equal(actual, expected);
  });

  test('mergeCliArgumentsWithConfig() returns CLI arguments when no config file is present', function () {
    const cliArguments = cliArgumentsFactory();
    const merged = mergeCliArgumentsWithConfig(cliArguments);
    if (merged.success) {
      const actual = merged.data;
      const expected = cliArguments;
      assert.deepEqual(actual, expected);
    } else {
      assert.fail();
    }
  });

  test('mergeCliArgumentsWithConfig() returns config file values when no CLI arguments are present', function () {
    const config = configFactory();
    const merged = mergeCliArgumentsWithConfig(undefined, config);
    if (merged.success) {
      const actual = merged.data;
      const expected = config;
      assert.deepEqual(actual, expected);
    } else {
      assert.fail();
    }
  });

  test('mergeCliArgumentsWithConfig() returns no success when no config file and no CLI arguments are present', function () {
    const actual = mergeCliArgumentsWithConfig().success;
    const expected = false;
    assert.equal(actual, expected);
  });

  test('mergeCliArgumentsWithConfig() prefers CLI arguments over configuration values', function () {
    const config = configFactory({
      gitlabUrl: 'https://example.com',
      projectId: 1,
      accessToken: '0',
    });
    const cliArguments = cliArgumentsFactory({
      gitlabUrl: 'https://gitlab.com',
      projectId: 42,
      accessToken: 'yBo4v',
      days: 42,
      trace: true,
    });
    const merged = mergeCliArgumentsWithConfig(cliArguments, config);
    if (merged.success) {
      const actual = merged.data;
      const expected = cliArguments;
      assert.deepEqual(actual, expected);
    } else {
      assert.fail('Merge should not fail');
    }
  });
});
