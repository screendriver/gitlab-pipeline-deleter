'use strict';

module.exports = function (config) {
  config.set({
    mutator: 'typescript',
    tsconfigFile: 'tsconfig.base.json',
    transpilers: ['typescript'],
    packageManager: 'npm',
    reporters: ['html', 'clear-text', 'progress'],
    testRunner: 'mocha',
    testFramework: 'mocha',
    mochaOptions: {
      config: './.mocharc.js',
      spec: ['test/unit/**/*.test.*'],
    },
    mutate: ['src/**/*.ts?(x)', '!src/bin.tsx', '!src/network.ts'],
    tempDirName: 'target/.stryker-tmp',
    htmlReporter: { baseDir: 'target/mutation-report/html' },
    thresholds: {
      break: 92,
    },
    coverageAnalysis: 'off',
  });
};
