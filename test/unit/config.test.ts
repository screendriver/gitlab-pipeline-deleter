import test from 'ava';
import sinon from 'sinon';
import { cosmiconfig } from 'cosmiconfig';
import { Factory } from 'fishery';
import { PartialConfigInput, Config, loadConfig, mergeCliArgumentsWithConfig } from '../../source/config.js';

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
        load: sinon.fake.resolves({
            config: undefined,
            filepath: '',
        }),
        search: sinon.fake(),
        ...overrides,
    };
}

test('loadConfig() returns a Result Ok with an empty object when no config exists', async (t) => {
    const explorer = createExplorer({
        load: sinon.fake.rejects(new Error('Not found')),
    });
    const config = await loadConfig('./not-found.js', explorer);

    config.match({
        Ok(configValue) {
            t.deepEqual(configValue, {});
        },
        Err() {
            t.fail('loadConfig() did not returned an expected Ok');
        },
    });
});

test('loadConfig() returns a Result Err when loading does not return an error object', async (t) => {
    const explorer = createExplorer({
        load: sinon.fake(() => {
            throw 42;
        }),
    });
    const config = await loadConfig('./not-found.js', explorer);

    config.match({
        Ok() {
            t.fail('loadConfig() did not returned an expected Err');
        },
        Err(error) {
            t.is(error, 'unknown');
        },
    });
});

test('loadConfig() returns a Result Ok when config is empty', async (t) => {
    const explorer = createExplorer({
        load: sinon.fake.resolves({
            isEmpty: true,
            config: undefined,
            filepath: '',
        }),
    });
    const config = await loadConfig('./empty-glpdrc.js', explorer);

    config.match({
        Ok(configValue) {
            t.deepEqual(configValue, {});
        },
        Err() {
            t.fail('loadConfig() did not returned an expected Ok');
        },
    });
});

test('loadConfig() returns a Result Err when loaded config is null', async (t) => {
    const explorer = createExplorer({
        load: sinon.fake.resolves(null),
    });
    const config = await loadConfig('./empty-glpdrc.js', explorer);

    config.match({
        Ok() {
            t.fail('loadConfig() did not returned an expected Err');
        },
        Err(error) {
            t.is(error, 'config-invalid');
        },
    });
});

test('loadConfig() returns an Result Ok when config is an empty object', async (t) => {
    const config = {};
    const explorer = createExplorer({
        load: sinon.fake.resolves({
            isEmpty: false,
            config,
            filepath: '',
        }),
    });
    const loadedConfig = await loadConfig('./empty-glpdrc.js', explorer);

    loadedConfig.match({
        Ok(configValue) {
            t.deepEqual(configValue, {});
        },
        Err() {
            t.fail('loadConfig() returned an unexpected Err');
        },
    });
});

test('loadConfig() returns a Result Err when config has unknown keys', async (t) => {
    const explorer = createExplorer({
        load: sinon.fake.resolves({
            isEmpty: false,
            config: {
                foo: 'bar',
            },
            filepath: '',
        }),
    });
    const loadedConfig = await loadConfig('./invalid-glpdrc.js', explorer);

    loadedConfig.match({
        Ok() {
            t.fail('loadConfig() did not returned an expected Err');
        },
        Err(error) {
            t.is(error, 'config-invalid');
        },
    });
});

test('loadConfig() returns a Result Err when gitlabUrl is not an URL', async (t) => {
    const config = partialConfigInputFactory.build({
        gitlabUrl: 'not-an-url',
    });
    const explorer = createExplorer({
        load: sinon.fake.resolves({
            isEmpty: false,
            config,
            filepath: '',
        }),
    });
    const loadedConfig = await loadConfig('./invalid-url-glpdrc.js', explorer);

    loadedConfig.match({
        Ok() {
            t.fail('loadConfig() did not returned an expected Err');
        },
        Err(error) {
            t.is(error, 'config-invalid');
        },
    });
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
            filepath: '',
        }),
    });
    const loadedConfig = await loadConfig('./partial-glpdrc.js', explorer);

    loadedConfig.match({
        Ok(configValue) {
            t.deepEqual(configValue, config);
        },
        Err() {
            t.fail('loadConfig() returned an unexpected Err');
        },
    });
});

test('loadConfig() returns a full config when all keys are set', async (t) => {
    const config = partialConfigInputFactory.build();
    const explorer = createExplorer({
        load: sinon.fake.resolves({
            isEmpty: false,
            config,
            filepath: '',
        }),
    });
    const loadedConfig = await loadConfig('./glpdrc.js', explorer);

    loadedConfig.match({
        Ok(configValue) {
            t.deepEqual(configValue, config);
        },
        Err() {
            t.fail('loadConfig() returned an unexpected Err');
        },
    });
});

interface TestMergeCliArgumentsConfigInvalidOptions {
    readonly cliArguments: PartialConfigInput;
    readonly config: PartialConfigInput;
}

const testMergeCliArgumentsConfigInvalidMacro = test.macro((t, options: TestMergeCliArgumentsConfigInvalidOptions) => {
    const { cliArguments, config } = options;

    const mergedConfig = mergeCliArgumentsWithConfig(cliArguments, config);

    mergedConfig.match({
        Ok() {
            t.fail('mergeCliArgumentsWithConfig() did not return an expected Err');
        },
        Err(error) {
            t.is(error, 'config-invalid');
        },
    });
});

test(
    'mergeCliArgumentsWithConfig() returns an Result Err when gitlabUrl was not set',
    testMergeCliArgumentsConfigInvalidMacro,
    {
        config: partialConfigInputFactory.build({ gitlabUrl: undefined }),
        cliArguments: partialConfigInputFactory.build({ gitlabUrl: undefined }),
    },
);

test(
    'mergeCliArgumentsWithConfig() returns an Result Err when projectId was not set',
    testMergeCliArgumentsConfigInvalidMacro,
    {
        config: partialConfigInputFactory.build({ projectId: undefined }),
        cliArguments: partialConfigInputFactory.build({ projectId: undefined }),
    },
);

test(
    'mergeCliArgumentsWithConfig() returns an Result Err when projectId is an empty string',
    testMergeCliArgumentsConfigInvalidMacro,
    {
        config: partialConfigInputFactory.build({ projectId: '' }),
        cliArguments: partialConfigInputFactory.build({ projectId: undefined }),
    },
);

test(
    'mergeCliArgumentsWithConfig() returns an Result Err when projectId is a negative number',
    testMergeCliArgumentsConfigInvalidMacro,
    {
        config: partialConfigInputFactory.build({ projectId: '-42' }),
        cliArguments: partialConfigInputFactory.build({ projectId: undefined }),
    },
);

test(
    'mergeCliArgumentsWithConfig() returns an Result Err when projectId is a non-numeric value',
    testMergeCliArgumentsConfigInvalidMacro,
    {
        config: partialConfigInputFactory.build({ projectId: 'foo,bar' }),
        cliArguments: partialConfigInputFactory.build({ projectId: undefined }),
    },
);

test(
    'mergeCliArgumentsWithConfig() returns an Result Err when accessToken was not set',
    testMergeCliArgumentsConfigInvalidMacro,
    {
        config: partialConfigInputFactory.build({ accessToken: undefined }),
        cliArguments: partialConfigInputFactory.build({ accessToken: undefined }),
    },
);

test('mergeCliArgumentsWithConfig() returns an Result Err when no config file and no CLI arguments are present', (t) => {
    const mergedConfig = mergeCliArgumentsWithConfig();

    mergedConfig.match({
        Ok() {
            t.fail('mergeCliArgumentsWithConfig() did not return an expected Err');
        },
        Err(error) {
            t.is(error, 'config-invalid');
        },
    });
});

interface TestMergeCliArgumentsOptions {
    readonly cliArguments?: PartialConfigInput;
    readonly config?: PartialConfigInput;
    readonly expectedConfig: Config;
}

const testMergeCliArgumentsMacro = test.macro((t, options: TestMergeCliArgumentsOptions) => {
    const { cliArguments, config, expectedConfig } = options;

    const mergedConfig = mergeCliArgumentsWithConfig(cliArguments, config);

    mergedConfig.match({
        Ok(configValue) {
            t.deepEqual(configValue, expectedConfig);
        },
        Err() {
            t.fail('expected mergeCliArgumentsWithConfig() to be successful but it wasn’t');
        },
    });
});

test('returns CLI arguments when no config file is present', testMergeCliArgumentsMacro, {
    cliArguments: partialConfigInputFactory.build({ projectId: '1' }),
    config: undefined,
    expectedConfig: configFactory.build({
        projectIds: [1],
    }),
});

test('recognizes multiple project ids when a comma separated string is given', testMergeCliArgumentsMacro, {
    cliArguments: partialConfigInputFactory.build({ projectId: '1,2,3' }),
    config: undefined,
    expectedConfig: configFactory.build({
        projectIds: [1, 2, 3],
    }),
});

test(
    'recognizes multiple project ids when a comma separated string is given with whitespace between',
    testMergeCliArgumentsMacro,
    {
        cliArguments: partialConfigInputFactory.build({ projectId: '1,2,3' }),
        config: undefined,
        expectedConfig: configFactory.build({
            projectIds: [1, 2, 3],
        }),
    },
);

test('returns config file values when no CLI arguments are present', testMergeCliArgumentsMacro, {
    cliArguments: undefined,
    config: partialConfigInputFactory.build({ projectId: '1' }),
    expectedConfig: configFactory.build({
        projectIds: [1],
    }),
});

test('prefers CLI arguments over configuration values', testMergeCliArgumentsMacro, {
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
    expectedConfig: {
        accessToken: '0',
        days: 42,
        gitlabUrl: 'https://example.com',
        projectIds: [1],
        trace: true,
    },
});
