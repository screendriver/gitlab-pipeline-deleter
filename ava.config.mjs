export default {
    files: ['./test/unit/**/*.test.{ts,tsx}'],
    extensions: {
        ts: 'module',
        tsx: 'module',
    },
    nodeArguments: ['--no-warnings', '--loader=tsx'],
};
