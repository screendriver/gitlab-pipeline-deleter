import test, { Macro } from 'ava';
import sinon from 'sinon';
import { cosmiconfig } from 'cosmiconfig';
import { stripIndent } from 'common-tags';
import { Factory } from 'fishery';
import { PartialConfigInput, Config, loadConfig, mergeCliArgumentsWithConfig } from '../../src/config';

const partialConfigInputFactory = Factory.define<PartialConfigInput>(() => {
    return {
        gitlabUrl: 'https://example.com',
        projectId: '42',
        accessToken: 'yBo4v',
        days: 30,
        trace: false,
    };
});

const configFactory = Factory.define<Config>(() => {
    return {
        gitlabUrl: 'https://example.com',
        projectIds: [21],
        accessToken: 'yBo4v',
        days: 30,
        trace: false,
    };
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

test('loadConfig() returns an Result Err when no config exists', async (t) => {
    const explorer = createExplorer({
        load: sinon.fake.rejects(new Error('Not found')),
    });
    const config = await loadConfig('./not-found.js', explorer);
    if (config.isOk()) {
        t.fail('loadConfig() did not returned an expected error');
        return;
    }

    const actual = config.error;
    const expected = 'Not found';
    t.is(actual, expected);
});

test('loadConfig() returns a Result Err when loading does not return an error object', async (t) => {
    const explorer = createExplorer({
        load: sinon.fake(() => {
            throw 42;
        }),
    });
    const config = await loadConfig('./not-found.js', explorer);
    if (config.isOk()) {
        t.fail('loadConfig() did not returned an expected error');
        return;
    }

    const actual = config.error;
    const expected = 'Unknown error';
    t.is(actual, expected);
});

test('loadConfig() returns a Result Err when config is empty', async (t) => {
    const explorer = createExplorer({
        load: sinon.fake.resolves({
            isEmpty: true,
        }),
    });
    const config = await loadConfig('./empty-glpdrc.js', explorer);
    if (config.isOk()) {
        t.fail('loadConfig() did not returned an expected error');
        return;
    }

    const actual = config.error;
    const expected = 'Config is empty';
    t.is(actual, expected);
});

test('loadConfig() returns a Result Err when loaded config is null', async (t) => {
    const explorer = createExplorer({
        load: sinon.fake.resolves(null),
    });
    const config = await loadConfig('./empty-glpdrc.js', explorer);
    if (config.isOk()) {
        t.fail('loadConfig() did not returned an expected error');
        return;
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
    t.is(actual, expected);
});

test('loadConfig() returns a empty object when config is an empty object', async (t) => {
    const config = {};
    const explorer = createExplorer({
        load: sinon.fake.resolves({
            isEmpty: false,
            config,
        }),
    });
    const loadedConfig = await loadConfig('./empty-glpdrc.js', explorer);
    if (loadedConfig.isErr()) {
        t.fail('loadConfig() returned an unexpected error');
        return;
    }

    const actual = loadedConfig.value;
    const expected = config;
    t.deepEqual(actual, expected);
});

test('loadConfig() returns a Result Err when config has unknown keys', async (t) => {
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
        t.fail('loadConfig() did not returned an expected error');
        return;
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
    t.is(actual, expected);
});

test('loadConfig() returns a Result Err when gitlabUrl is not an URL', async (t) => {
    const config = partialConfigInputFactory.build({
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
        t.fail('loadConfig() did not returned an expected error');
        return;
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
    t.is(actual, expected);
});

test('loadConfig() returns a partial config when not all keys are set', async (t) => {
    const config = partialConfigInputFactory.build({
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
        t.fail('loadConfig() returned an unexpected error');
        return;
    }

    const actual = loadedConfig.value;
    const expected = config;
    t.deepEqual(actual, expected);
});

test('loadConfig() returns a full config when all keys are set', async (t) => {
    const config = partialConfigInputFactory.build();
    const explorer = createExplorer({
        load: sinon.fake.resolves({
            isEmpty: false,
            config,
        }),
    });
    const loadedConfig = await loadConfig('./glpdrc.js', explorer);
    if (loadedConfig.isErr()) {
        t.fail('loadConfig() returned an unexpected error');
        return;
    }

    const actual = loadedConfig.value;
    const expected = config;
    t.deepEqual(actual, expected);
});

test('mergeCliArgumentsWithConfig() returns no success when gitlabUrl was not set', (t) => {
    const config = partialConfigInputFactory.build({ gitlabUrl: undefined });
    const cliArguments = partialConfigInputFactory.build({ gitlabUrl: undefined });

    const actual = mergeCliArgumentsWithConfig(cliArguments, config).success;
    const expected = false;
    t.is(actual, expected);
});

test('mergeCliArgumentsWithConfig() returns no success when projectId was not set', (t) => {
    const config = partialConfigInputFactory.build({ projectId: undefined });
    const cliArguments = partialConfigInputFactory.build({ projectId: undefined });

    const actual = mergeCliArgumentsWithConfig(cliArguments, config).success;
    const expected = false;
    t.is(actual, expected);
});

test('mergeCliArgumentsWithConfig() returns no success when projectId is an empty string', (t) => {
    const config = partialConfigInputFactory.build({ projectId: '' });
    const cliArguments = partialConfigInputFactory.build({ projectId: undefined });

    const actual = mergeCliArgumentsWithConfig(cliArguments, config).success;
    const expected = false;
    t.is(actual, expected);
});

test('mergeCliArgumentsWithConfig() returns no success when projectId is a negative number', (t) => {
    const config = partialConfigInputFactory.build({ projectId: '-42' });
    const cliArguments = partialConfigInputFactory.build({ projectId: undefined });

    const actual = mergeCliArgumentsWithConfig(cliArguments, config).success;
    const expected = false;
    t.is(actual, expected);
});

test('mergeCliArgumentsWithConfig() returns no success when projectId is a non-numeric value', (t) => {
    const config = partialConfigInputFactory.build({ projectId: 'foo,bar' });
    const cliArguments = partialConfigInputFactory.build({ projectId: undefined });

    const actual = mergeCliArgumentsWithConfig(cliArguments, config).success;
    const expected = false;
    t.is(actual, expected);
});

test('mergeCliArgumentsWithConfig() returns no success when accessToken was not set', (t) => {
    const config = partialConfigInputFactory.build({ accessToken: undefined });
    const cliArguments = partialConfigInputFactory.build({ accessToken: undefined });

    const actual = mergeCliArgumentsWithConfig(cliArguments, config).success;
    const expected = false;
    t.is(actual, expected);
});

test('mergeCliArgumentsWithConfig() returns no success when no config file and no CLI arguments are present', (t) => {
    const actual = mergeCliArgumentsWithConfig().success;
    const expected = false;
    t.is(actual, expected);
});

const mergeCliArgumentsMacro: Macro<[{ cliArguments?: PartialConfigInput; config?: PartialConfigInput }, Config]> = (
    t,
    input,
    expected,
) => {
    const mergedConfig = mergeCliArgumentsWithConfig(input.cliArguments, input.config);

    if (mergedConfig.success) {
        const actual = mergedConfig.data;
        t.deepEqual(actual, expected);
    } else {
        t.fail('expected mergeCliArgumentsWithConfig() to be successful but it wasn’t');
    }
};

test(
    'returns CLI arguments when no config file is present',
    mergeCliArgumentsMacro,
    {
        cliArguments: partialConfigInputFactory.build({ projectId: '1' }),
        config: undefined,
    },
    configFactory.build({
        projectIds: [1],
    }),
);

test(
    'recognizes multiple project ids when a comma separated string is given',
    mergeCliArgumentsMacro,
    {
        cliArguments: partialConfigInputFactory.build({ projectId: '1,2,3' }),
        config: undefined,
    },
    configFactory.build({
        projectIds: [1, 2, 3],
    }),
);

test(
    'recognizes multiple project ids when a comma separated string is given with whitespace between',
    mergeCliArgumentsMacro,
    {
        cliArguments: partialConfigInputFactory.build({ projectId: '1,2,3' }),
        config: undefined,
    },
    configFactory.build({
        projectIds: [1, 2, 3],
    }),
);

test(
    'returns config file values when no CLI arguments are present',
    mergeCliArgumentsMacro,
    {
        cliArguments: undefined,
        config: partialConfigInputFactory.build({ projectId: '1' }),
    },
    configFactory.build({
        projectIds: [1],
    }),
);

test(
    'prefers CLI aguments over configuration values',
    mergeCliArgumentsMacro,
    {
        cliArguments: partialConfigInputFactory.build({
            gitlabUrl: 'https://example.com',
            projectId: '1',
            accessToken: '0',
            trace: true,
        }),
        config: partialConfigInputFactory.build({
            gitlabUrl: 'https://gitlab.com',
            projectId: '42',
            accessToken: 'yBo4v',
            days: 42,
            trace: false,
        }),
    },
    {
        accessToken: '0',
        days: 30,
        gitlabUrl: 'https://example.com',
        projectIds: [1],
        trace: true,
    },
);
