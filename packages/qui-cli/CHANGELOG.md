# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [0.5.10](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.5.9...qui-cli-plugin/0.5.10) (2026-01-18)


### Bug Fixes

* include @qui-cli/log as peer ([422eb25](https://github.com/battis/oauth2-cli/commit/422eb252fb778e8e12c9fe2ecc0d889ed8e82a0a))

## [0.5.9](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.5.8...qui-cli-plugin/0.5.9) (2026-01-17)


### Bug Fixes

* debug request/response/JSON from Client rather than plugin ([2ed73e1](https://github.com/battis/oauth2-cli/commit/2ed73e18089ffed4fe75d717d523fc86e2ae7f91))

## [0.5.8](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.5.7...qui-cli-plugin/0.5.8) (2026-01-17)


### Features

* add debugging output for requests ([8066cab](https://github.com/battis/oauth2-cli/commit/8066cabf56521f43ff90af21edabd9c20997e4cb))

## [0.5.7](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.5.6...qui-cli-plugin/0.5.7) (2026-01-17)


### Bug Fixes

* include scope param ([abf53c1](https://github.com/battis/oauth2-cli/commit/abf53c156a226e51c771a405058640a380407813))

## [0.5.6](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.5.5...qui-cli-plugin/0.5.6) (2026-01-15)


### Bug Fixes

* correctly implement template Client type ([ed6ac1c](https://github.com/battis/oauth2-cli/commit/ed6ac1cc63b1c41eceb93311105a1f61890a07c8))

## [0.5.5](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.5.4...qui-cli-plugin/0.5.5) (2026-01-15)


### Bug Fixes

* getClient() should return the type instantiated by instiateClient() ([46a4507](https://github.com/battis/oauth2-cli/commit/46a450707954917e1f55595fb3e35f0a62f475fc))

## [0.5.4](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.5.3...qui-cli-plugin/0.5.4) (2026-01-15)


### Bug Fixes

* export EnvironmentStorage from class as well as module ([01cb4ea](https://github.com/battis/oauth2-cli/commit/01cb4eaf54beebd16870adbb1b2664b4e585b14f))

## [0.5.3](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.5.2...qui-cli-plugin/0.5.3) (2026-01-15)


### Bug Fixes

* instantiateClient() _returns_ the client ([a302fdb](https://github.com/battis/oauth2-cli/commit/a302fdba916f68756b24319d432cc6adce09a1ba))

## [0.5.2](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.5.1...qui-cli-plugin/0.5.2) (2026-01-15)


### Features

* allow injection of custom oauth2-cli Client implementations via instantiateClient() ([cb1b94f](https://github.com/battis/oauth2-cli/commit/cb1b94fb1891343f00b5793fd6f7db33e6489c14))
* re-export all of oauth2-cli under the plugin module/class namespaces ([0cbdafc](https://github.com/battis/oauth2-cli/commit/0cbdafc84853f4a904e33640b65e4f0300f00b4a))

## [0.5.1](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.5.0...qui-cli-plugin/0.5.1) (2026-01-15)


### Bug Fixes

* implement convenience methods as methods, not properties ([a3f67fe](https://github.com/battis/oauth2-cli/commit/a3f67fecde50ae19d8cf960fe6828623e745126b))

## [0.5.0](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.4.3...qui-cli-plugin/0.5.0) (2026-01-14)


### ⚠ BREAKING CHANGES

* move to currently active Node.js v24
* consistent parameter names and URL support links

### Features

* add configurable hints for CLI option parameters ([b78ab2b](https://github.com/battis/oauth2-cli/commit/b78ab2b894a7807e2fced4531930c648fe275304))
* configurable opt names to avoid collision with multiple APIs ([d147e3e](https://github.com/battis/oauth2-cli/commit/d147e3e9dfce1f0f4629d5a0e7f649258b7e9487))
* consistent parameter names and URL support links ([671c371](https://github.com/battis/oauth2-cli/commit/671c3715c7218ab3b92e84a6da69835c5148462a))


### Bug Fixes

* export pre-registered plugin as an EJS module ([19b232e](https://github.com/battis/oauth2-cli/commit/19b232e5c65de4fd43fa604c8a3c38718d4a7ab9))
* move to currently active Node.js v24 ([a651159](https://github.com/battis/oauth2-cli/commit/a6511594460c7fbc9f59e8a86c6b2f17bfb3564e))

## [0.4.3](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.4.2...qui-cli-plugin/0.4.3) (2026-01-12)


### Bug Fixes

* more generous peer dependencies ([38cbed2](https://github.com/battis/oauth2-cli/commit/38cbed28d1046fafe73c9458f3a2f3a3799afaa9))

## [0.4.2](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.4.1...qui-cli-plugin/0.4.2) (2026-01-04)


### Bug Fixes

* typo in fetchJSON name ([a19ba97](https://github.com/battis/oauth2-cli/commit/a19ba9700e32a69f7714a428b3c5c60739a11c16))

## [0.4.1](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.4.0...qui-cli-plugin/0.4.1) (2026-01-04)

## [0.4.0](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.3.4...qui-cli-plugin/0.4.0) (2026-01-04)


### ⚠ BREAKING CHANGES

* rename for simplicity

### Features

* rename for simplicity ([110c415](https://github.com/battis/oauth2-cli/commit/110c415d03ef06c0d777ffea5c4cdd9d04a068eb))

## [0.3.4](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.3.3...qui-cli-plugin/0.3.4) (2026-01-03)


### Bug Fixes

* export ConfigurationProposal ([3c558c2](https://github.com/battis/oauth2-cli/commit/3c558c2dda012872747cf74fb76dcdd2740f04c6))

## [0.3.3](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.3.2...qui-cli-plugin/0.3.3) (2026-01-03)


### Bug Fixes

* export request param types ([244f588](https://github.com/battis/oauth2-cli/commit/244f5886148721f2be06c5da5b3a659fa17391da))

## [0.3.2](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.3.1...qui-cli-plugin/0.3.2) (2026-01-03)


### Bug Fixes

* export Credentials ([a175394](https://github.com/battis/oauth2-cli/commit/a1753947d1119e2810d22275c6fbca27b0b19db5))

## [0.3.1](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.3.0...qui-cli-plugin/0.3.1) (2026-01-03)


### Features

* extend @oauth2-cli/qui-cli-plugin by instantiating new versions ([14713c5](https://github.com/battis/oauth2-cli/commit/14713c5d1c884c9a1d62ca34d0e5c364ffd8f19b))

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
