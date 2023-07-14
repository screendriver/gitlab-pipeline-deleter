import defaultConfig from './ava.config.mjs';

export default {
    ...defaultConfig,
    files: ['./test/integration/**/*.test.{ts,tsx}'],
};
