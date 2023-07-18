export default {
    files: ['./test/unit/**/*.test.{ts,tsx}'],
    environmentVariables: {
        FORCE_COLOR: '1',
    },
    typescript: {
        extensions: ['ts', 'tsx'],
        rewritePaths: {
            'source/': 'target/source/',
            'test/': 'target/test/',
        },
        compile: false,
    },
};
