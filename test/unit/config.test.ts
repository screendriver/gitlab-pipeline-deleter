import { assert } from 'chai';
import sinon from 'sinon';
import { cosmiconfig } from 'cosmiconfig';
import { define } from 'cooky-cutter';
import { PartialConfigInput, Config, loadConfig, mergeCliArgumentsWithConfig } from '../../src/config';

const partialConfigInputFactory = define<PartialConfigInput>({
  gitlabUrl: 'https://example.com',
  projectId: '42',
  accessToken: 'yBo4v',
  days: 30,
  trace: false,
});

const configFactory = define<Config>({
  gitlabUrl: 'https://example.com',
  projectIds: () => [21],
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

  test('loadConfig() returns undefined when loaded config is null', async function () {
    const explorer = createExplorer({
      load: sinon.fake.resolves(null),
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
    const config = partialConfigInputFactory({
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
    const config = partialConfigInputFactory({
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
    const config = partialConfigInputFactory();
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
    const config = partialConfigInputFactory({ gitlabUrl: undefined });
    const cliArguments = partialConfigInputFactory({ gitlabUrl: undefined });
    const actual = mergeCliArgumentsWithConfig(cliArguments, config).success;
    const expected = false;
    assert.equal(actual, expected);
  });

  test('mergeCliArgumentsWithConfig() returns no success when projectId was not set', function () {
    const config = partialConfigInputFactory({ projectId: undefined });
    const cliArguments = partialConfigInputFactory({ projectId: undefined });
    const actual = mergeCliArgumentsWithConfig(cliArguments, config).success;
    const expected = false;
    assert.equal(actual, expected);
  });

  test('mergeCliArgumentsWithConfig() returns no success when projectId is an empty string', function () {
    const config = partialConfigInputFactory({ projectId: '' });
    const cliArguments = partialConfigInputFactory({ projectId: undefined });
    const actual = mergeCliArgumentsWithConfig(cliArguments, config).success;
    const expected = false;
    assert.equal(actual, expected);
  });

  test('mergeCliArgumentsWithConfig() returns no success when projectId is a negative number', function () {
    const config = partialConfigInputFactory({ projectId: '-42' });
    const cliArguments = partialConfigInputFactory({ projectId: undefined });
    const actual = mergeCliArgumentsWithConfig(cliArguments, config).success;
    const expected = false;
    assert.equal(actual, expected);
  });

  test('mergeCliArgumentsWithConfig() returns no success when projectId is a non-numeric value', function () {
    const config = partialConfigInputFactory({ projectId: 'foo,bar' });
    const cliArguments = partialConfigInputFactory({ projectId: undefined });
    const actual = mergeCliArgumentsWithConfig(cliArguments, config).success;
    const expected = false;
    assert.equal(actual, expected);
  });

  test('mergeCliArgumentsWithConfig() returns no success when accessToken was not set', function () {
    const config = partialConfigInputFactory({ accessToken: undefined });
    const cliArguments = partialConfigInputFactory({ accessToken: undefined });
    const actual = mergeCliArgumentsWithConfig(cliArguments, config).success;
    const expected = false;
    assert.equal(actual, expected);
  });

  test('mergeCliArgumentsWithConfig() returns CLI arguments when no config file is present', function () {
    const cliArguments = partialConfigInputFactory({ projectId: '1' });
    const merged = mergeCliArgumentsWithConfig(cliArguments);
    if (merged.success) {
      const actual = merged.data;
      const expected = configFactory({
        gitlabUrl: cliArguments.gitlabUrl,
        projectIds: [1],
        accessToken: cliArguments.accessToken,
        days: cliArguments.days,
        trace: cliArguments.trace,
      });
      assert.deepEqual(actual, expected);
    } else {
      assert.fail();
    }
  });

  test('mergeCliArgumentsWithConfig() recognizes multiple project ids when a comma separate string is given', function () {
    const cliArguments = partialConfigInputFactory({ projectId: '1,2,3' });
    const merged = mergeCliArgumentsWithConfig(cliArguments);
    if (merged.success) {
      const actual = merged.data;
      const expected = configFactory({
        gitlabUrl: cliArguments.gitlabUrl,
        projectIds: [1, 2, 3],
        accessToken: cliArguments.accessToken,
        days: cliArguments.days,
        trace: cliArguments.trace,
      });
      assert.deepEqual(actual, expected);
    } else {
      assert.fail();
    }
  });

  test('mergeCliArgumentsWithConfig() recognizes multiple project ids when a comma separate string is given with whitespace between', function () {
    const cliArguments = partialConfigInputFactory({ projectId: '1, 2 ,\t3\n' });
    const merged = mergeCliArgumentsWithConfig(cliArguments);
    if (merged.success) {
      const actual = merged.data;
      const expected = configFactory({
        gitlabUrl: cliArguments.gitlabUrl,
        projectIds: [1, 2, 3],
        accessToken: cliArguments.accessToken,
        days: cliArguments.days,
        trace: cliArguments.trace,
      });
      assert.deepEqual(actual, expected);
    } else {
      assert.fail();
    }
  });

  test('mergeCliArgumentsWithConfig() returns config file values when no CLI arguments are present', function () {
    const config = partialConfigInputFactory({ projectId: '1' });
    const merged = mergeCliArgumentsWithConfig(undefined, config);
    if (merged.success) {
      const actual = merged.data;
      const expected = configFactory({
        gitlabUrl: config.gitlabUrl,
        projectIds: [1],
        accessToken: config.accessToken,
        days: config.days,
        trace: config.trace,
      });
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
    const config = partialConfigInputFactory({
      gitlabUrl: 'https://example.com',
      projectId: '1',
      accessToken: '0',
    });
    const cliArguments = partialConfigInputFactory({
      gitlabUrl: 'https://gitlab.com',
      projectId: '42',
      accessToken: 'yBo4v',
      days: 42,
      trace: true,
    });
    const merged = mergeCliArgumentsWithConfig(cliArguments, config);
    if (merged.success) {
      const actual = merged.data;
      const expected = configFactory({
        gitlabUrl: cliArguments.gitlabUrl,
        projectIds: [42],
        accessToken: cliArguments.accessToken,
        days: cliArguments.days,
        trace: cliArguments.trace,
      });
      assert.deepEqual(actual, expected);
    } else {
      assert.fail('Merge should not fail');
    }
  });
});
