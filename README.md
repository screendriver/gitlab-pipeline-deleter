# gitlab-pipeline-deleter

[![GitHub Actions status](https://github.com/screendriver/gitlab-pipeline-deleter/workflows/CI/badge.svg)](https://github.com/screendriver/gitlab-pipeline-deleter/actions)
[![codecov](https://codecov.io/gh/screendriver/gitlab-pipeline-deleter/branch/main/graph/badge.svg)](https://codecov.io/gh/screendriver/gitlab-pipeline-deleter)

A CLI tool that deletes old [GitLab CI](https://docs.gitlab.com/ee/ci/) pipelines.

```
Usage: glpd [options] <gitlab-url> <project-id> <access-token>

Deletes old GitLab pipelines

Options:
  -d --days <days>  older than days (default: "30")
  -h, --help        display help for command
```
