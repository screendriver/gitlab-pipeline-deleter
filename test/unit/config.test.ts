import { Callback, test } from 'uvu';
import * as assert from 'uvu/assert';
import sinon from 'sinon';
import { cosmiconfig } from 'cosmiconfig';
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
        load: sinon.fake.resolves({
            config: undefined,
            filepath: '',
        }),
        search: sinon.fake(),
        ...overrides,
    };
}

test('loadConfig() returns a Result Ok with an empty object when no config exists', async () => {
    const explorer = createExplorer({
        load: sinon.fake.rejects(new Error('Not found')),
    });
    const config = await loadConfig('./not-found.js', explorer);

    config.match({
        Ok(configValue) {
            assert.equal(configValue, {});
        },
        Err() {
            assert.unreachable('loadConfig() did not returned an expected Ok');
        },
    });
});

test('loadConfig() returns a Result Err when loading does not return an error object', async () => {
    const explorer = createExplorer({
        load: sinon.fake(() => {
            throw 42;
        }),
    });
    const config = await loadConfig('./not-found.js', explorer);

    config.match({
        Ok() {
            assert.unreachable('loadConfig() did not returned an expected Err');
        },
        Err(error) {
            assert.is(error, 'unknown');
        },
    });
});

test('loadConfig() returns a Result Ok when config is empty', async () => {
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
            assert.equal(configValue, {});
        },
        Err() {
            assert.unreachable('loadConfig() did not returned an expected Ok');
        },
    });
});

test('loadConfig() returns a Result Err when loaded config is null', async () => {
    const explorer = createExplorer({
        load: sinon.fake.resolves(null),
    });
    const config = await loadConfig('./empty-glpdrc.js', explorer);

    config.match({
        Ok() {
            assert.unreachable('loadConfig() did not returned an expected Err');
        },
        Err(error) {
            assert.is(error, 'config-invalid');
        },
    });
});

test('loadConfig() returns an Result Ok when config is an empty object', async () => {
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
            assert.equal(configValue, {});
        },
        Err() {
            assert.unreachable('loadConfig() returned an unexpected Err');
        },
    });
});

test('loadConfig() returns a Result Err when config has unknown keys', async () => {
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
            assert.unreachable('loadConfig() did not returned an expected Err');
        },
        Err(error) {
            assert.is(error, 'config-invalid');
        },
    });
});

test('loadConfig() returns a Result Err when gitlabUrl is not an URL', async () => {
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
            assert.unreachable('loadConfig() did not returned an expected Err');
        },
        Err(error) {
            assert.is(error, 'config-invalid');
        },
    });
});

test('loadConfig() returns a partial config when not all keys are set', async () => {
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
            assert.equal(configValue, config);
        },
        Err() {
            assert.unreachable('loadConfig() returned an unexpected Err');
        },
    });
});

test('loadConfig() returns a full config when all keys are set', async () => {
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
            assert.equal(configValue, config);
        },
        Err() {
            assert.unreachable('loadConfig() returned an unexpected Err');
        },
    });
});

interface TestMergeCliArgumentsConfigInvalidOptions {
    readonly cliArguments: PartialConfigInput;
    readonly config: PartialConfigInput;
}

function testMergeCliArgumentsConfigInvalid(options: TestMergeCliArgumentsConfigInvalidOptions): Callback {
    const { cliArguments, config } = options;

    return () => {
        const mergedConfig = mergeCliArgumentsWithConfig(cliArguments, config);

        mergedConfig.match({
            Ok() {
                assert.unreachable('mergeCliArgumentsWithConfig() did not return an expected Err');
            },
            Err(error) {
                assert.is(error, 'config-invalid');
            },
        });
    };
}

test(
    'mergeCliArgumentsWithConfig() returns an Result Err when gitlabUrl was not set',
    testMergeCliArgumentsConfigInvalid({
        config: partialConfigInputFactory.build({ gitlabUrl: undefined }),
        cliArguments: partialConfigInputFactory.build({ gitlabUrl: undefined }),
    }),
);

test(
    'mergeCliArgumentsWithConfig() returns an Result Err when projectId was not set',
    testMergeCliArgumentsConfigInvalid({
        config: partialConfigInputFactory.build({ projectId: undefined }),
        cliArguments: partialConfigInputFactory.build({ projectId: undefined }),
    }),
);

test(
    'mergeCliArgumentsWithConfig() returns an Result Err when projectId is an empty string',
    testMergeCliArgumentsConfigInvalid({
        config: partialConfigInputFactory.build({ projectId: '' }),
        cliArguments: partialConfigInputFactory.build({ projectId: undefined }),
    }),
);

test(
    'mergeCliArgumentsWithConfig() returns an Result Err when projectId is a negative number',
    testMergeCliArgumentsConfigInvalid({
        config: partialConfigInputFactory.build({ projectId: '-42' }),
        cliArguments: partialConfigInputFactory.build({ projectId: undefined }),
    }),
);

test(
    'mergeCliArgumentsWithConfig() returns an Result Err when projectId is a non-numeric value',
    testMergeCliArgumentsConfigInvalid({
        config: partialConfigInputFactory.build({ projectId: 'foo,bar' }),
        cliArguments: partialConfigInputFactory.build({ projectId: undefined }),
    }),
);

test(
    'mergeCliArgumentsWithConfig() returns an Result Err when accessToken was not set',
    testMergeCliArgumentsConfigInvalid({
        config: partialConfigInputFactory.build({ accessToken: undefined }),
        cliArguments: partialConfigInputFactory.build({ accessToken: undefined }),
    }),
);

test('mergeCliArgumentsWithConfig() returns an Result Err when no config file and no CLI arguments are present', () => {
    const mergedConfig = mergeCliArgumentsWithConfig();

    mergedConfig.match({
        Ok() {
            assert.unreachable('mergeCliArgumentsWithConfig() did not return an expected Err');
        },
        Err(error) {
            assert.is(error, 'config-invalid');
        },
    });
});

interface TestMergeCliArgumentsOptions {
    readonly cliArguments?: PartialConfigInput;
    readonly config?: PartialConfigInput;
    readonly expectedConfig: Config;
}

function testMergeCliArguments(options: TestMergeCliArgumentsOptions): Callback {
    const { cliArguments, config, expectedConfig } = options;

    return () => {
        const mergedConfig = mergeCliArgumentsWithConfig(cliArguments, config);

        mergedConfig.match({
            Ok(configValue) {
                assert.equal(configValue, expectedConfig);
            },
            Err() {
                assert.unreachable('expected mergeCliArgumentsWithConfig() to be successful but it wasn’t');
            },
        });
    };
}

test(
    'returns CLI arguments when no config file is present',
    testMergeCliArguments({
        cliArguments: partialConfigInputFactory.build({ projectId: '1' }),
        config: undefined,
        expectedConfig: configFactory.build({
            projectIds: [1],
        }),
    }),
);

test(
    'recognizes multiple project ids when a comma separated string is given',
    testMergeCliArguments({
        cliArguments: partialConfigInputFactory.build({ projectId: '1,2,3' }),
        config: undefined,
        expectedConfig: configFactory.build({
            projectIds: [1, 2, 3],
        }),
    }),
);

test(
    'recognizes multiple project ids when a comma separated string is given with whitespace between',
    testMergeCliArguments({
        cliArguments: partialConfigInputFactory.build({ projectId: '1,2,3' }),
        config: undefined,
        expectedConfig: configFactory.build({
            projectIds: [1, 2, 3],
        }),
    }),
);

test(
    'returns config file values when no CLI arguments are present',
    testMergeCliArguments({
        cliArguments: undefined,
        config: partialConfigInputFactory.build({ projectId: '1' }),
        expectedConfig: configFactory.build({
            projectIds: [1],
        }),
    }),
);

test(
    'prefers CLI aguments over configuration values',
    testMergeCliArguments({
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
            days: 30,
            gitlabUrl: 'https://example.com',
            projectIds: [1],
            trace: true,
        },
    }),
);

test.run();
