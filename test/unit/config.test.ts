import assert from 'assert';
import sinon from 'sinon';
import { cosmiconfig } from 'cosmiconfig';
import { stripIndent } from 'common-tags';
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

suite('loadConfig()', function () {
  test('returns an Result Err when no config exists', async function () {
    const explorer = createExplorer({
      load: sinon.fake.rejects(new Error('Not found')),
    });
    const config = await loadConfig('./not-found.js', explorer);
    if (config.isOk()) {
      assert.fail('loadConfig() did not returned an expected error');
    }
    const actual = config.error;
    const expected = 'Not found';
    assert.strictEqual(actual, expected);
  });

  test('returns a Result Err when loading does not return an error object', async function () {
    const explorer = createExplorer({
      load: sinon.fake(() => {
        throw 42;
      }),
    });
    const config = await loadConfig('./not-found.js', explorer);
    if (config.isOk()) {
      assert.fail('loadConfig() did not returned an expected error');
    }
    const actual = config.error;
    const expected = 'Unknown error';
    assert.strictEqual(actual, expected);
  });

  test('returns a Result Err when config is empty', async function () {
    const explorer = createExplorer({
      load: sinon.fake.resolves({
        isEmpty: true,
      }),
    });
    const config = await loadConfig('./empty-glpdrc.js', explorer);
    if (config.isOk()) {
      assert.fail('loadConfig() did not returned an expected error');
    }
    const actual = config.error;
    const expected = 'Config is empty';
    assert.strictEqual(actual, expected);
  });

  test('returns a Result Err when loaded config is null', async function () {
    const explorer = createExplorer({
      load: sinon.fake.resolves(null),
    });
    const config = await loadConfig('./empty-glpdrc.js', explorer);
    if (config.isOk()) {
      assert.fail('loadConfig() did not returned an expected error');
    }
    const actual = config.error;
    const expected = stripIndent`
        [
          {
            "code": "invalid_type",
            "expected": "object",
            "received": "undefined",
            "path": [],
            "message": "Required"
          }
        ]
      `;
    assert.strictEqual(actual, expected);
  });

  test('returns a empty object when config is an empty object', async function () {
    const config = {};
    const explorer = createExplorer({
      load: sinon.fake.resolves({
        isEmpty: false,
        config,
      }),
    });
    const loadedConfig = await loadConfig('./empty-glpdrc.js', explorer);
    if (loadedConfig.isErr()) {
      assert.fail('loadConfig() returned an unexpected error');
    }
    const actual = loadedConfig.value;
    const expected = config;
    assert.deepStrictEqual(actual, expected);
  });

  test('returns a Result Err when config has unknown keys', async function () {
    const explorer = createExplorer({
      load: sinon.fake.resolves({
        isEmpty: false,
        config: {
          foo: 'bar',
        },
      }),
    });
    const loadedConfig = await loadConfig('./invalid-glpdrc.js', explorer);
    if (loadedConfig.isOk()) {
      assert.fail('loadConfig() did not returned an expected error');
    }
    const actual = loadedConfig.error;
    const expected = stripIndent`
        [
          {
            "code": "unrecognized_keys",
            "keys": [
              "foo"
            ],
            "path": [],
            "message": "Unrecognized key(s) in object: \'foo\'"
          }
        ]
      `;
    assert.strictEqual(actual, expected);
  });

  test('returns a Result Err when gitlabUrl is not an URL', async function () {
    const config = partialConfigInputFactory({
      gitlabUrl: 'not-an-url',
    });
    const explorer = createExplorer({
      load: sinon.fake.resolves({
        isEmpty: false,
        config,
      }),
    });
    const loadedConfig = await loadConfig('./invalid-url-glpdrc.js', explorer);
    if (loadedConfig.isOk()) {
      assert.fail('loadConfig() did not returned an expected error');
    }
    const actual = loadedConfig.error;
    const expected = stripIndent`
        [
          {
            "validation": "url",
            "code": "invalid_string",
            "message": "Invalid url",
            "path": [
              "gitlabUrl"
            ]
          }
        ]
      `;
    assert.strictEqual(actual, expected);
  });

  test('returns a partial config when not all keys are set', async function () {
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
    const loadedConfig = await loadConfig('./partial-glpdrc.js', explorer);
    if (loadedConfig.isErr()) {
      assert.fail('loadConfig() returned an unexpected error');
    }
    const actual = loadedConfig.value;
    const expected = config;
    assert.deepStrictEqual(actual, expected);
  });

  test('returns a full config when all keys are set', async function () {
    const config = partialConfigInputFactory();
    const explorer = createExplorer({
      load: sinon.fake.resolves({
        isEmpty: false,
        config,
      }),
    });
    const loadedConfig = await loadConfig('./glpdrc.js', explorer);
    if (loadedConfig.isErr()) {
      assert.fail('loadConfig() returned an unexpected error');
    }
    const actual = loadedConfig.value;
    const expected = config;
    assert.deepStrictEqual(actual, expected);
  });
});

suite('mergeCliArgumentsWithConfig()', function () {
  test('returns no success when gitlabUrl was not set', function () {
    const config = partialConfigInputFactory({ gitlabUrl: undefined });
    const cliArguments = partialConfigInputFactory({ gitlabUrl: undefined });
    const actual = mergeCliArgumentsWithConfig(cliArguments, config).success;
    const expected = false;
    assert.strictEqual(actual, expected);
  });

  test('returns no success when projectId was not set', function () {
    const config = partialConfigInputFactory({ projectId: undefined });
    const cliArguments = partialConfigInputFactory({ projectId: undefined });
    const actual = mergeCliArgumentsWithConfig(cliArguments, config).success;
    const expected = false;
    assert.strictEqual(actual, expected);
  });

  test('returns no success when projectId is an empty string', function () {
    const config = partialConfigInputFactory({ projectId: '' });
    const cliArguments = partialConfigInputFactory({ projectId: undefined });
    const actual = mergeCliArgumentsWithConfig(cliArguments, config).success;
    const expected = false;
    assert.strictEqual(actual, expected);
  });

  test('returns no success when projectId is a negative number', function () {
    const config = partialConfigInputFactory({ projectId: '-42' });
    const cliArguments = partialConfigInputFactory({ projectId: undefined });
    const actual = mergeCliArgumentsWithConfig(cliArguments, config).success;
    const expected = false;
    assert.strictEqual(actual, expected);
  });

  test('returns no success when projectId is a non-numeric value', function () {
    const config = partialConfigInputFactory({ projectId: 'foo,bar' });
    const cliArguments = partialConfigInputFactory({ projectId: undefined });
    const actual = mergeCliArgumentsWithConfig(cliArguments, config).success;
    const expected = false;
    assert.strictEqual(actual, expected);
  });

  test('returns no success when accessToken was not set', function () {
    const config = partialConfigInputFactory({ accessToken: undefined });
    const cliArguments = partialConfigInputFactory({ accessToken: undefined });
    const actual = mergeCliArgumentsWithConfig(cliArguments, config).success;
    const expected = false;
    assert.strictEqual(actual, expected);
  });

  test('returns no success when no config file and no CLI arguments are present', function () {
    const actual = mergeCliArgumentsWithConfig().success;
    const expected = false;
    assert.strictEqual(actual, expected);
  });

  [
    {
      title: 'returns CLI arguments when no config file is present',
      cliArguments: partialConfigInputFactory({ projectId: '1' }),
      expectedConfig: configFactory({
        projectIds: [1],
      }),
    },
    {
      title: 'recognizes multiple project ids when a comma separated string is given',
      cliArguments: partialConfigInputFactory({ projectId: '1,2,3' }),
      expectedConfig: configFactory({
        projectIds: [1, 2, 3],
      }),
    },
    {
      title: 'recognizes multiple project ids when a comma separated string is given with whitespace between',
      cliArguments: partialConfigInputFactory({ projectId: '1, 2 ,\t3\n' }),
      expectedConfig: configFactory({
        projectIds: [1, 2, 3],
      }),
    },
    {
      title: 'returns config file values when no CLI arguments are present',
      config: partialConfigInputFactory({ projectId: '1' }),
      expectedConfig: configFactory({
        projectIds: [1],
      }),
    },
    {
      title: 'prefers CLI aguments over configuration values',
      cliArguments: partialConfigInputFactory({
        gitlabUrl: 'https://example.com',
        projectId: '1',
        accessToken: '0',
        trace: true,
      }),
      config: partialConfigInputFactory({
        gitlabUrl: 'https://gitlab.com',
        projectId: '42',
        accessToken: 'yBo4v',
        days: 42,
        trace: false,
      }),
      expectedConfig: {
        accessToken: '0',
        days: 30,
        gitlabUrl: 'https://example.com',
        projectIds: [1],
        trace: true,
      },
    },
  ].forEach((testCase) => {
    test(testCase.title, function () {
      const mergedConfig = mergeCliArgumentsWithConfig(testCase.cliArguments, testCase.config);

      if (mergedConfig.success) {
        const actual = mergedConfig.data;
        assert.deepStrictEqual(actual, testCase.expectedConfig);
      } else {
        assert.fail('expected mergeCliArgumentsWithConfig() to be successful but it wasn’t');
      }
    });
  });
});
