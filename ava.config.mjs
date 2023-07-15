export default {
    files: ['./test/unit/**/*.test.{ts,tsx}'],
    typescript: {
        extensions: ['ts', 'tsx'],
        rewritePaths: {
            'src/': 'target/src/',
            'test/': 'target/test/',
        },
        compile: false,
    },
};
