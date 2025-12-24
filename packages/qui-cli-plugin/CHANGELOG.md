# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [0.3.0](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.2.7...qui-cli-plugin/0.3.0) (2025-12-24)


### ⚠ BREAKING CHANGES

* resolve 1Password secret references successfully

### Bug Fixes

* resolve 1Password secret references successfully ([c4446e1](https://github.com/battis/oauth2-cli/commit/c4446e197a66271dac3ea8d58ff44725cc6be1db))

## [0.2.7](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.2.6...qui-cli-plugin/0.2.7) (2025-12-23)


### Bug Fixes

* remove overriding default redirect_uri ([2268428](https://github.com/battis/oauth2-cli/commit/2268428bf461b3b92301dde9767558ba3ab5f2f5))

## [0.2.6](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.2.5...qui-cli-plugin/0.2.6) (2025-12-23)

## [0.2.5](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.2.4...qui-cli-plugin/0.2.5) (2025-12-23)


### Bug Fixes

* expose headers configuration ([bac6bcb](https://github.com/battis/oauth2-cli/commit/bac6bcbf351155472494b82ad620f6b4bc19a1e6))

## [0.2.4](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.2.3...qui-cli-plugin/0.2.4) (2025-12-23)


### Bug Fixes

* more aggressively fix typing for partial configuration ([97f7e0c](https://github.com/battis/oauth2-cli/commit/97f7e0c034202fb26654677b5a3a836ff989b116))

## [0.2.3](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.2.2...qui-cli-plugin/0.2.3) (2025-12-23)


### Bug Fixes

* allow partial override of environment variable names and suppressed opt args ([c8a118b](https://github.com/battis/oauth2-cli/commit/c8a118ba6dae62f29549ef272448a4a6adea553c))

## [0.2.2](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.2.1...qui-cli-plugin/0.2.2) (2025-12-23)


### Features

* add optional typing to requestJSON() ([5f7cf39](https://github.com/battis/oauth2-cli/commit/5f7cf39d8dc0ca86cbe3df7e8493d3273e630573))
* configurable options and usage ([aadbc4b](https://github.com/battis/oauth2-cli/commit/aadbc4bffc9eda241763ecd9f134963517250e5f))
* default suppress token path storage ([9df7f4f](https://github.com/battis/oauth2-cli/commit/9df7f4f6312713e2086366350f0c546a975b2c31))
* provide EnvironmentStorage implementation ([55fc676](https://github.com/battis/oauth2-cli/commit/55fc676716fa1e4830a6a890b6d0bf5cecf0f57f))


### Bug Fixes

* update to current [@qui-cli](https://github.com/qui-cli) versions ([d54c521](https://github.com/battis/oauth2-cli/commit/d54c5210e55586ed688afa42840ec2b9e1cffeb0))

## [0.2.1](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.2.0...qui-cli-plugin/0.2.1) (2025-09-11)


### Bug Fixes

* update dependencies to address transient openid-client config error ([f0ca9a8](https://github.com/battis/oauth2-cli/commit/f0ca9a8d2bb4551b80a49e48aa43df5ba66a5a9b))

## [0.2.0](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.1.1...qui-cli-plugin/0.2.0) (2025-03-09)

### Features

- **oauth2-cli:** detect and warn about reused localhost ports ([3431d84](https://github.com/battis/oauth2-cli/commit/3431d84d47251dd9fba47b23bbfd3dcf653fc7d3))

### Bug Fixes

- **oauth2-configure:** remove redundant caching ([7294e6a](https://github.com/battis/oauth2-cli/commit/7294e6a7aec373f72abc7c9e7c2ce4c659e3cba5))

## [0.1.1](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.1.0...qui-cli-plugin/0.1.1) (2025-03-07)

### Features

- **oauth2-cli:** attempt to reuse refresh_token if none returned ([8210698](https://github.com/battis/oauth2-cli/commit/82106982e508c1f5f54a16590594daa47f80d57d))

## 0.1.0 (2025-03-06)

### Features

- **qui-cli-plugin:** Simple qui-cli plugin wrapper for oauth2-cli ([90831ff](https://github.com/battis/oauth2-cli/commit/90831ff603274de103be1d8e167473a41bf99904))
