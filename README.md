# gitlab-pipeline-deleter

[![GitHub Actions status](https://github.com/screendriver/gitlab-pipeline-deleter/workflows/CI/badge.svg)](https://github.com/screendriver/gitlab-pipeline-deleter/actions)
[![codecov](https://codecov.io/gh/screendriver/gitlab-pipeline-deleter/branch/main/graph/badge.svg)](https://codecov.io/gh/screendriver/gitlab-pipeline-deleter)

A Node.js CLI tool that deletes old [GitLab CI](https://docs.gitlab.com/ee/ci/) pipelines.

### Installation

```sh
$ npm install -g gitlab-pipeline-deleter
```

### Usage

```
Usage: glpd [options] [gitlab-url] [project-id] [access-token]

Deletes old GitLab pipelines

Options:
  -d --days <days>  older than days (default: "30")
  --trace           show stack traces for errors when possible (default: false)
  -h, --help        display help for command
```

You can use either the command line arguments `gitlab-url`, `project-id` and `access-token` or you can create a `glpd.config.js` configuration file that exports an object. Both CommonJS (`.cjs`) and ECMAScript Modules (`.mjs`) are supported. All of the command line arguments are supported but needs to be written in `camelCase`:

```js
export default {
    gitlabUrl: 'https://example.com',
    projectId: '42',
    accessToken: '<my-token>',
    days: 30,
    trace: false,
};
```

If you specify command line arguments **and** a configuration file the command line arguments will overwrite the values in the configuration file. So the CLI arguments has always precedence.

Multiple project ids can be configured by providing a comma-separated list to the `projectId` argument.
