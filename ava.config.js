export default {
    files: ['./test/unit/**/*.test.{ts,tsx}'],
    environmentVariables: {
        FORCE_COLOR: '1',
    },
    typescript: {
        extensions: ['ts', 'tsx'],
        rewritePaths: {
            'src/': 'target/src/',
            'test/': 'target/test/',
        },
        compile: false,
    },
};
