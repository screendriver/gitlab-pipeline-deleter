import baseConfig from './ava.config.mjs';

export default {
    ...baseConfig,
    files: ['test/integration/**/*.test.*'],
};
