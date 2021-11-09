export default {
  files: ['test/integration/**/*.test.*'],
  extensions: ['ts', 'tsx'],
  require: ['ts-node/register/transpile-only'],
  timeout: '30s',
};
