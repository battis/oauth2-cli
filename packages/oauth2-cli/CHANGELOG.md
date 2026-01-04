# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

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
