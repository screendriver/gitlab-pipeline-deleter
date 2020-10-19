'use strict';

/**
 * @type {import('@stryker-mutator/api/core').StrykerOptions}
 */
module.exports = {
  checkers: ['typescript'],
  mutate: ['src/**/*.ts?(x)', '!src/bin.tsx', '!src/network.ts'],
  testRunner: 'command',
  commandRunner: { command: 'npm run test:unit' },
  tempDirName: 'target/.stryker-tmp',
  reporters: ['html', 'clear-text', 'dots'],
  htmlReporter: { baseDir: 'target/mutation-report/html' },
  thresholds: {
    break: 90,
  },
  coverageAnalysis: 'off',
};
