# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [0.6.0](https://github.com/battis/oauth2-cli/compare/oauth2-cli/0.5.1...oauth2-cli/0.6.0) (2026-02-15)


### ⚠ BREAKING CHANGES

* limit TokenStorage to storing _only_ refresh_tokens
* improve express shutdown, refactor entire package

### Features

* compatible with @battis/google-cloud-run-to-localhost ([3e449b1](https://github.com/battis/oauth2-cli/commit/3e449b14d546759f7e6543c86350ea83b60a80a7))
* display authorization starting URL on command line as well as opening browser ([fb72bcf](https://github.com/battis/oauth2-cli/commit/fb72bcffafaf66453f8f8f0f8af4b27ef11827c6))
* externalize path/port identification to gcrtl ([0f6c28b](https://github.com/battis/oauth2-cli/commit/0f6c28b31a7888eac524b28bcdc9c8eabbf57d91))
* fallback to package templates if ejs present but no alternative template providedd ([6b05454](https://github.com/battis/oauth2-cli/commit/6b05454976b1fb4144f91ba51fc1c9331f1c0f34))
* limit TokenStorage to storing _only_ refresh_tokens ([3de9c96](https://github.com/battis/oauth2-cli/commit/3de9c96510d15eebd51a0be7d8df278614541f95))


### Bug Fixes

* attempt to authorize and retry when encountering 401 error ([bc75fed](https://github.com/battis/oauth2-cli/commit/bc75fed052b548e41411287f7d98fa78c3f27ee5))
* improve express shutdown, refactor entire package ([a740313](https://github.com/battis/oauth2-cli/commit/a740313c33d26f07ebab5b282607d8828cf3c3a7))

## [0.5.1](https://github.com/battis/oauth2-cli/compare/oauth2-cli/0.5.0...oauth2-cli/0.5.1) (2026-01-20)


### Bug Fixes

* allow extending private methods for debugging ([ea9957f](https://github.com/battis/oauth2-cli/commit/ea9957f71629c4a177ebdf6acf0aecaa299a5260))

## [0.5.0](https://github.com/battis/oauth2-cli/compare/oauth2-cli/0.4.0...oauth2-cli/0.5.0) (2026-01-14)


### ⚠ BREAKING CHANGES

* move to Node.js v24 support

### Features

* move to Node.js v24 support ([03d5cf4](https://github.com/battis/oauth2-cli/commit/03d5cf455e38f7beb2fbf93f1612acb906c5f5a0))

## [0.4.0](https://github.com/battis/oauth2-cli/compare/oauth2-cli/0.3.0...oauth2-cli/0.4.0) (2026-01-04)


### ⚠ BREAKING CHANGES

* remove deprecated TokenManager

### Features

* provide fetch() and fetchJSON() methods to translate to openid-client requests ([3fe454f](https://github.com/battis/oauth2-cli/commit/3fe454f28497d704041ea4e599a4ad5b2b08b469))


### Bug Fixes

* remove deprecated TokenManager ([2dde67e](https://github.com/battis/oauth2-cli/commit/2dde67edd70b151bd1bab6de3845839a06957e65))

## [0.3.0](https://github.com/battis/oauth2-cli/compare/oauth2-cli/0.2.3...oauth2-cli/0.3.0) (2025-12-24)


### ⚠ BREAKING CHANGES

* resolve 1Password secret references successfully

### Bug Fixes

* resolve 1Password secret references successfully ([c4446e1](https://github.com/battis/oauth2-cli/commit/c4446e197a66271dac3ea8d58ff44725cc6be1db))

## [0.2.3](https://github.com/battis/oauth2-cli/compare/oauth2-cli/0.2.2...oauth2-cli/0.2.3) (2025-12-23)


### Bug Fixes

* add wildcard param name ([97b2e58](https://github.com/battis/oauth2-cli/commit/97b2e58835941797fce564c736d8c4bd6e3ce97f))

## [0.2.2](https://github.com/battis/oauth2-cli/compare/oauth2-cli/0.2.1...oauth2-cli/0.2.2) (2025-12-23)

## [0.2.1](https://github.com/battis/oauth2-cli/compare/oauth2-cli/0.2.0...oauth2-cli/0.2.1) (2025-09-11)


### Bug Fixes

* update dependencies to address transient openid-client config error ([f0ca9a8](https://github.com/battis/oauth2-cli/commit/f0ca9a8d2bb4551b80a49e48aa43df5ba66a5a9b))

## [0.2.0](https://github.com/battis/oauth2-cli/compare/oauth2-cli/0.1.6...oauth2-cli/0.2.0) (2025-03-09)

### Features

- **oauth2-cli:** detect and warn about reused localhost ports ([3431d84](https://github.com/battis/oauth2-cli/commit/3431d84d47251dd9fba47b23bbfd3dcf653fc7d3))

### Bug Fixes

- **oauth2-configure:** remove redundant caching ([7294e6a](https://github.com/battis/oauth2-cli/commit/7294e6a7aec373f72abc7c9e7c2ce4c659e3cba5))

## [0.1.6](https://github.com/battis/oauth2-cli/compare/oauth2-cli/0.1.5...oauth2-cli/0.1.6) (2025-03-08)

### Features

- **oauth2-cli:** export Credentials type for convenience ([f000b56](https://github.com/battis/oauth2-cli/commit/f000b56a587c021d64a294ff33d42fa3966afd38))

## [0.1.5](https://github.com/battis/oauth2-cli/compare/oauth2-cli/0.1.4...oauth2-cli/0.1.5) (2025-03-07)

### Features

- **oauth2-cli:** attempt to reuse refresh_token if none returned ([8210698](https://github.com/battis/oauth2-cli/commit/82106982e508c1f5f54a16590594daa47f80d57d))

## [0.1.4](https://github.com/battis/oauth2-cli/compare/oauth2-cli/0.1.3...oauth2-cli/0.1.4) (2025-03-06)

### Features

- **oauth2-cli:** cache token in memory ([68ac632](https://github.com/battis/oauth2-cli/commit/68ac6323031cbcaa0dd7b444dcd6da62b4f9a48d))
- **oauth2-cli:** Client.request() and Client.requestJSON() ([50c1198](https://github.com/battis/oauth2-cli/commit/50c11985c0ae8f135932d05bae2bf74ff1cd29df))
- **oauth2-cli:** deprecate TokenManager (replaced by Client) ([991ac42](https://github.com/battis/oauth2-cli/commit/991ac42eb2cc83b4b31e60856faf192233cd35f3))

### Bug Fixes

- **oauth2-cli:** improve error window title ([97a4c1c](https://github.com/battis/oauth2-cli/commit/97a4c1c9f98aaacf7ce63fb05a64cfee5f4dd0ce))

## [0.1.3](https://github.com/battis/oauth2-cli/compare/oauth2-cli/0.1.2...oauth2-cli/0.1.3) (2025-03-06)

### Patch Changes

- efd09f9: docs: fix broken package paths

## 0.1.2

### Patch Changes

- 6e6a22a: sky-api, bump deps

## 0.1.1

### Patch Changes

- b6001cc: fix open dep

## 0.1.0

### Minor Changes

- 4d2e132: Initial release

### Patch Changes

- Updated dependencies [4d2e132]
  - @battis/oauth2-configure@0.1.0
