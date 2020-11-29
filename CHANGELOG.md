## [2.2.7](https://github.com/screendriver/gitlab-pipeline-deleter/compare/v2.2.6...v2.2.7) (2020-11-29)


### Bug Fixes

* **deps:** update dependency zod to v1.11.11 ([551710a](https://github.com/screendriver/gitlab-pipeline-deleter/commit/551710ac7c86f80fac2fa9ee29778efa6c73f73f))

## [2.2.6](https://github.com/screendriver/gitlab-pipeline-deleter/compare/v2.2.5...v2.2.6) (2020-10-29)


### Bug Fixes

* **deps:** update dependency zod to v1.11.10 ([e07443a](https://github.com/screendriver/gitlab-pipeline-deleter/commit/e07443adfb3b089e8e982702625a243ccd52e441))

## [2.2.5](https://github.com/screendriver/gitlab-pipeline-deleter/compare/v2.2.4...v2.2.5) (2020-10-25)


### Bug Fixes

* **deps:** update dependency commander to v6.2.0 ([5cceeac](https://github.com/screendriver/gitlab-pipeline-deleter/commit/5cceeacc6e6e1355b05b5a136d96aa1fe6f37616))

## [2.2.4](https://github.com/screendriver/gitlab-pipeline-deleter/compare/v2.2.3...v2.2.4) (2020-10-22)


### Bug Fixes

* **deps:** update dependency react to v17.0.1 ([a76a0ed](https://github.com/screendriver/gitlab-pipeline-deleter/commit/a76a0edffe08f8cab683d6245c259d658e15e799))

## [2.2.3](https://github.com/screendriver/gitlab-pipeline-deleter/compare/v2.2.2...v2.2.3) (2020-10-20)


### Bug Fixes

* **deps:** update dependency react to v17 ([dd52fe0](https://github.com/screendriver/gitlab-pipeline-deleter/commit/dd52fe05201a01f0b54b302deb1728e6fc9fdfe3))

## [2.2.2](https://github.com/screendriver/gitlab-pipeline-deleter/compare/v2.2.1...v2.2.2) (2020-10-20)


### Bug Fixes

* **deps:** update dependency ink to v3.0.8 ([b3cedd3](https://github.com/screendriver/gitlab-pipeline-deleter/commit/b3cedd3dbba8e8909bf6baea6d8f3852c238d23e))

## [2.2.1](https://github.com/screendriver/gitlab-pipeline-deleter/compare/v2.2.0...v2.2.1) (2020-10-20)


### Bug Fixes

* **deps:** update dependency got to v11.8.0 ([d87377c](https://github.com/screendriver/gitlab-pipeline-deleter/commit/d87377c2f1ba5a2be9a1e3043ca2fc6f80395d81))

# [2.2.0](https://github.com/screendriver/gitlab-pipeline-deleter/compare/v2.1.3...v2.2.0) (2020-10-20)


### Features

* show how many pipelines in total were found ([e6c6e5e](https://github.com/screendriver/gitlab-pipeline-deleter/commit/e6c6e5e93adbd27f8527c816cd998a566907b251))

## [2.1.3](https://github.com/screendriver/gitlab-pipeline-deleter/compare/v2.1.2...v2.1.3) (2020-10-19)


### Bug Fixes

* create delete queue instead of throttling a mapped Array ([68256b3](https://github.com/screendriver/gitlab-pipeline-deleter/commit/68256b3b3634395ff772e1635ba1e9bfb26c03c1))

## [2.1.2](https://github.com/screendriver/gitlab-pipeline-deleter/compare/v2.1.1...v2.1.2) (2020-10-17)


### Bug Fixes

* **interval:** double interval to 2 seconds ([050a79d](https://github.com/screendriver/gitlab-pipeline-deleter/commit/050a79dc699e08108fe1de48c7ca7a4c6f9d5800))

## [2.1.1](https://github.com/screendriver/gitlab-pipeline-deleter/compare/v2.1.0...v2.1.1) (2020-10-14)


### Bug Fixes

* **deps:** update dependency react to v16.14.0 ([0dcd0db](https://github.com/screendriver/gitlab-pipeline-deleter/commit/0dcd0dbcacb8463178f3479ff4ea75cccd8621fe))

# [2.1.0](https://github.com/screendriver/gitlab-pipeline-deleter/compare/v2.0.1...v2.1.0) (2020-10-13)


### Features

* accept multiple project ids by providing a comma separate list of ids ([b23ba9f](https://github.com/screendriver/gitlab-pipeline-deleter/commit/b23ba9fdfd06364e02dc5e1c58780a6e068558c3))
* only allow postive numbers for projectId ([ace3ede](https://github.com/screendriver/gitlab-pipeline-deleter/commit/ace3ede120a3c2baf2ebea8ab430dd9f2ffe23e5))

## [2.0.1](https://github.com/screendriver/gitlab-pipeline-deleter/compare/v2.0.0...v2.0.1) (2020-10-10)


### Bug Fixes

* **deps:** update dependency tslib to v2.0.3 ([a4014ee](https://github.com/screendriver/gitlab-pipeline-deleter/commit/a4014eec5e079959efcfaef09c795942507b1f5a))

# [2.0.0](https://github.com/screendriver/gitlab-pipeline-deleter/compare/v1.1.2...v2.0.0) (2020-10-09)


### Bug Fixes

* **config:** read configuration file from current working directory ([4eccc70](https://github.com/screendriver/gitlab-pipeline-deleter/commit/4eccc704ded89c5abccb0dce2434aff3af16a63e))
* **config:** rename glpdrc.js to glpd.config.js ([fc7865b](https://github.com/screendriver/gitlab-pipeline-deleter/commit/fc7865b119e8933fd31e4e6c3c3294d570da18ee))
* **config:** use commander's parseAsync() function ([65f438c](https://github.com/screendriver/gitlab-pipeline-deleter/commit/65f438c991eb5580f9847d67f692e6e161a96f17))


### Features

* **config:** create function to merge CLI arguments with config file ([5a95fe6](https://github.com/screendriver/gitlab-pipeline-deleter/commit/5a95fe63cabd83ece787ecc5aa66cbf96d44af23))
* **config:** create module to load glpdrc.js config file ([bc606b6](https://github.com/screendriver/gitlab-pipeline-deleter/commit/bc606b672c6530fb5c1bb4f54bce654a4c3c8fe1))
* **config:** read arguments from CLI and config file ([f5126a3](https://github.com/screendriver/gitlab-pipeline-deleter/commit/f5126a3e933c28de1f87c55a32cd882ec60f027e))
* **config:** remove not needed <Main /> component ([2461497](https://github.com/screendriver/gitlab-pipeline-deleter/commit/2461497ec75ac04b90e809b65b3dfddae5e30318))


### BREAKING CHANGES

* **config:** CLI arguments are now optional instead of required

## [1.1.2](https://github.com/screendriver/gitlab-pipeline-deleter/compare/v1.1.1...v1.1.2) (2020-10-07)


### Bug Fixes

* throttle concurrent delete requests to 10/s ([7f89ab7](https://github.com/screendriver/gitlab-pipeline-deleter/commit/7f89ab751f33ce4db82bc5cdf525f5fe9c5e3db8))

## [1.1.1](https://github.com/screendriver/gitlab-pipeline-deleter/compare/v1.1.0...v1.1.1) (2020-10-07)


### Bug Fixes

* report with server response when delete request fails ([8ad1d02](https://github.com/screendriver/gitlab-pipeline-deleter/commit/8ad1d02d88e32f81659efcead7590561bcdd3279))

# [1.1.0](https://github.com/screendriver/gitlab-pipeline-deleter/compare/v1.0.2...v1.1.0) (2020-10-07)


### Bug Fixes

* provide missing prop in integration test ([05b63ac](https://github.com/screendriver/gitlab-pipeline-deleter/commit/05b63ac11dc1048dff24d3cef7d363a85f600276))


### Features

* add --trace option to show stack traces ([1ae918e](https://github.com/screendriver/gitlab-pipeline-deleter/commit/1ae918e42cf7ccadcf39ea71e2f6e1b6a69c414f))

## [1.0.2](https://github.com/screendriver/gitlab-pipeline-deleter/compare/v1.0.1...v1.0.2) (2020-10-07)


### Bug Fixes

* change order of semantic-release plugins ([4aa1171](https://github.com/screendriver/gitlab-pipeline-deleter/commit/4aa1171d56c1429c3b5487760aa38ce0f91ab1ff))

## [1.0.1](https://github.com/screendriver/gitlab-pipeline-deleter/compare/v1.0.0...v1.0.1) (2020-10-07)


### Bug Fixes

* typo in name of binary ([e8e04ee](https://github.com/screendriver/gitlab-pipeline-deleter/commit/e8e04ee952eb826b0f77f7ad2be50ab245ce75ec))
* **deps:** update dependency ink to v3.0.7 ([6e98f8e](https://github.com/screendriver/gitlab-pipeline-deleter/commit/6e98f8e4861b772246262c05a94f94625fc2a10d))
* **deps:** update dependency tslib to v2.0.2 ([1bed303](https://github.com/screendriver/gitlab-pipeline-deleter/commit/1bed303e039bce3b3191519e25dd96f370a1dafe))
* **deps:** update dependency urlcat to v2.0.4 ([2a4f5cb](https://github.com/screendriver/gitlab-pipeline-deleter/commit/2a4f5cbe51a6117a1cf002a1daa068f31977a05c))

# 1.0.0 (2020-10-06)


### Bug Fixes

* delete empty file ([af4a001](https://github.com/screendriver/gitlab-pipeline-deleter/commit/af4a00160873c7a98a3c07769f3e14248ac08ade))
* return an immutable list from getting pipeline list ([bc99597](https://github.com/screendriver/gitlab-pipeline-deleter/commit/bc9959726250634550ec3ee089b28a6d042196ee))
* switch arguments order in calculating difference in days ([80bd679](https://github.com/screendriver/gitlab-pipeline-deleter/commit/80bd6796802ce4c1b0ca16408cea85a734e223f9))


### Features

* create <App /> component ([43dfa95](https://github.com/screendriver/gitlab-pipeline-deleter/commit/43dfa957e5c5e3e116a8315e4674e4a22847c14e))
* create <Error /> component ([28f695d](https://github.com/screendriver/gitlab-pipeline-deleter/commit/28f695d151081fde02f601d81d8b311af7f389f5))
* create <Main /> component ([78faaf3](https://github.com/screendriver/gitlab-pipeline-deleter/commit/78faaf31219a5d6dfcc396201685e46ae79cb856))
* create function that deletes a pipeline ([b86a6d0](https://github.com/screendriver/gitlab-pipeline-deleter/commit/b86a6d004c6db2f2ffe104fd22dd5a004e741b5e))
* create function that filters pipelines by date ([086ff19](https://github.com/screendriver/gitlab-pipeline-deleter/commit/086ff190a9c6b4fd595564a735bdb70187144181))
* create function to list pipelines ([c80bf98](https://github.com/screendriver/gitlab-pipeline-deleter/commit/c80bf9840793c9c48ad8693d1f1110c48bfb7a99))
* create network module ([4822ea4](https://github.com/screendriver/gitlab-pipeline-deleter/commit/4822ea42752bb450b0e4c7ecc8dd8cb8f236427a))
* increase number of items to 100 in pipelines list ([919524b](https://github.com/screendriver/gitlab-pipeline-deleter/commit/919524b2cf0ca02f51c9b4e14d4aa8fd09527328))
* initial commit ([ff7183c](https://github.com/screendriver/gitlab-pipeline-deleter/commit/ff7183c7bfca344804e63787ad7f0696cd2bab01))
* parse command line arguments ([605c361](https://github.com/screendriver/gitlab-pipeline-deleter/commit/605c361fd606eac419a97b9a3fb5d3726fc0bc44))
* pass parsed project id to <App /> component ([188aeea](https://github.com/screendriver/gitlab-pipeline-deleter/commit/188aeeaf3ff1f8d33d9c4a6f51899ca60c84669b))
* pass side effects to <Main /> from application entry point ([e2eb578](https://github.com/screendriver/gitlab-pipeline-deleter/commit/e2eb578a6d8ecba6fc8adfb5b1b148a88f04354c))
* require project id to be set as command line argument ([4f00fa9](https://github.com/screendriver/gitlab-pipeline-deleter/commit/4f00fa99e203563375d99d5509786728fb87c9af))
* return a function instead of a value in GitLab API ([c40bb2e](https://github.com/screendriver/gitlab-pipeline-deleter/commit/c40bb2edc39dd4ff5c8360ef1c6ea2558046f3b2))
* use native Arrays instead of list ([20841bf](https://github.com/screendriver/gitlab-pipeline-deleter/commit/20841bfb00a6d4ec8b2ed845a7824a2a929bae18))
