import defaultConfig from './ava.config.js';

export default {
    ...defaultConfig,
    files: ['./test/integration/**/*.test.{ts,tsx}'],
};
