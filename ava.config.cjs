module.exports = {
    files: ['test/unit/**/*.test.*'],
    extensions: ['ts', 'tsx'],
    require: ['ts-node/register/transpile-only'],
    environmentVariables: {
        FORCE_COLOR: '1',
        TS_NODE_PROJECT: 'tsconfig.base.json',
    },
};
