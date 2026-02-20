# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [1.0.0](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.7.16...qui-cli-plugin/1.0.0) (2026-02-20)


### ⚠ BREAKING CHANGES

* dist/Unregistered.js -> extendable
* rename WebServer -> Localhost, authorize.ejs -> launch.ejs
* simplify access to client name by making it (only) a read-only property

### Features

* dist/Unregistered.js -> extendable ([1734d05](https://github.com/battis/oauth2-cli/commit/1734d05845e2b5960a6636d591605973df38b696))
* human-readable reason for authorizing access ([0cce8c2](https://github.com/battis/oauth2-cli/commit/0cce8c2e13213e92befc4f58c81e6d7f9637ea63))
* rename WebServer -> Localhost, authorize.ejs -> launch.ejs ([09723a8](https://github.com/battis/oauth2-cli/commit/09723a81640cb8ad0e767584a81b9b56f5a617b2))
* simplify access to client name by making it (only) a read-only property ([401c870](https://github.com/battis/oauth2-cli/commit/401c870071c0e9ffc65282e8c42270dff6e897a2))


### Bug Fixes

* improve client debug logging ([f53575d](https://github.com/battis/oauth2-cli/commit/f53575d855665a868f8a803ff3fb197faff9543d))

## [0.7.16](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.7.15...qui-cli-plugin/0.7.16) (2026-02-19)


### Bug Fixes

* removing potential source of authorization failure ([15d7d89](https://github.com/battis/oauth2-cli/commit/15d7d8980337df3f66afa8398b3cccb1fc6b56b6))

## [0.7.15](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.7.14...qui-cli-plugin/0.7.15) (2026-02-19)


### Bug Fixes

* further debugging log refinement ([26bad46](https://github.com/battis/oauth2-cli/commit/26bad46741fc0b2075099054e7127e90a1a4a002))

## [0.7.14](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.7.13...qui-cli-plugin/0.7.14) (2026-02-19)


### Bug Fixes

* further refinement in debug logging ([568e563](https://github.com/battis/oauth2-cli/commit/568e563bc0a918cd9741951654db685488f10330))

## [0.7.13](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.7.12...qui-cli-plugin/0.7.13) (2026-02-19)

Incorporates oauth2-cli@0.8.8

## [0.7.10](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.7.9...qui-cli-plugin/0.7.10) (2026-02-19)

Incorporates oauth2-cli@0.8.5 updates

## [0.7.7](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.7.6...qui-cli-plugin/0.7.7) (2026-02-19)

### Features

- human-readable client name for clarity ([68b4287](https://github.com/battis/oauth2-cli/commit/68b42872998ec423440d07447012282528e3ee76))

## [0.7.6](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.7.5...qui-cli-plugin/0.7.6) (2026-02-19)

### Bug Fixes

- further config debugging ([95fe40f](https://github.com/battis/oauth2-cli/commit/95fe40f59669f6c498123046c6ea11f88a90fd13))

## [0.7.5](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.7.4...qui-cli-plugin/0.7.5) (2026-02-19)

### Bug Fixes

- improved debugging output ([a0e6cea](https://github.com/battis/oauth2-cli/commit/a0e6ceaf12dadd9b2bf1753c602165f7194cbf24))

## [0.7.4](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.7.3...qui-cli-plugin/0.7.4) (2026-02-18)

## [0.7.3](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.7.2...qui-cli-plugin/0.7.3) (2026-02-18)

Incorporate fixes from oauth2-cli@0.8.2

## [0.7.2](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.7.1...qui-cli-plugin/0.7.2) (2026-02-18)

### Features

- `Unregistered` namespace for convenient extension ([0889d98](https://github.com/battis/oauth2-cli/commit/0889d98c26fd50cb8bf6485db2df39ebd1fb2b39))

### Bug Fixes

- injected usage documentation follows generated usage documentation ([b8b0640](https://github.com/battis/oauth2-cli/commit/b8b064028502e058f9a2b890bd408f8458a2db8e))

## [0.7.1](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.7.0...qui-cli-plugin/0.7.1) (2026-02-18)

### Features

- provide parameterized credentials with simplified typing ([5a92c67](https://github.com/battis/oauth2-cli/commit/5a92c67dbd4ab52fa4f0b02a910e788f5ae67adb))

### Bug Fixes

- simplify dependency hierarchy ([0a72c5d](https://github.com/battis/oauth2-cli/commit/0a72c5df3c814e63ad001a2a15fa0bf7ab72b195))

## [0.7.0](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.6.6...qui-cli-plugin/0.7.0) (2026-02-17)

### ⚠ BREAKING CHANGES

- clarify subclass groupings and extensibility
- simplify credentials structure
- rename Token.TokenStorage to less redundant Token.Storage
- simplify namespacing of Injection and Scope
- improved clarity of errors and causes
- remove option args for secrets

### Features

- add base_url for API requests (but still fall back to issuer, if not present) ([324b071](https://github.com/battis/oauth2-cli/commit/324b0718f6a86b8d29465802a5add7a21cc49192))
- clarify subclass groupings and extensibility ([4fec372](https://github.com/battis/oauth2-cli/commit/4fec372019603c4bfada0e26d1813b3c196db536))
- remove option args for secrets ([eaf55ea](https://github.com/battis/oauth2-cli/commit/eaf55ea7f5f1b2ee1fb3f037b9393a4be95bc19a))
- rename Token.TokenStorage to less redundant Token.Storage ([149d65a](https://github.com/battis/oauth2-cli/commit/149d65ac218a2c230ed8bca76963e44a5a6ff441))
- simplify credentials structure ([0e95439](https://github.com/battis/oauth2-cli/commit/0e95439a30f78268ddf7363dc4feeb0b1ff0edba))
- simplify namespacing of Injection and Scope ([b5db750](https://github.com/battis/oauth2-cli/commit/b5db7503f557a0c2092d327742b1bdd82be0edbb))

### Bug Fixes

- improved clarity of errors and causes ([9f1ddce](https://github.com/battis/oauth2-cli/commit/9f1ddcec82c3295e39fc8857784634da072e7570))
- make oauth2-cli peer to allow patches to propogate ([395dfb0](https://github.com/battis/oauth2-cli/commit/395dfb0b89d504dfc1ca92ac23a1ca5722045dda))
- pass configured views (and base_url) to client ([af8b15f](https://github.com/battis/oauth2-cli/commit/af8b15f359299746cfe4e08c70b28fbd04eabe37))
- use configured base_url, not just environment variable ([5f82f9d](https://github.com/battis/oauth2-cli/commit/5f82f9d134353bcd54c661189c0666ccc16a040e))

## [0.6.3](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.6.2...qui-cli-plugin/0.6.3) (2026-02-16)

### Bug Fixes

- export Request ([bad6d04](https://github.com/battis/oauth2-cli/commit/bad6d0479c6c8481c3ad56aa7b141a73dc04f729))

## [0.6.2](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.6.1...qui-cli-plugin/0.6.2) (2026-02-16)

### Bug Fixes

- export ClientOptions for instantiateClient implementation ([23eefbf](https://github.com/battis/oauth2-cli/commit/23eefbfa7a29d59e66463922b731183804c7eb62))

## [0.6.1](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.6.0...qui-cli-plugin/0.6.1) (2026-02-16)

### Bug Fixes

- fix accidental regression and re-export unregistered components from OAuth2 ([b5b62bb](https://github.com/battis/oauth2-cli/commit/b5b62bb1735f0e899bf84c83b39e61499ee8da44))

## [0.6.0](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.5.11...qui-cli-plugin/0.6.0) (2026-02-15)

### ⚠ BREAKING CHANGES

- limit TokenStorage to storing _only_ refresh_tokens
- rewritten from scratch to be more easily maintainable

### Features

- limit TokenStorage to storing _only_ refresh_tokens ([3de9c96](https://github.com/battis/oauth2-cli/commit/3de9c96510d15eebd51a0be7d8df278614541f95))
- rewritten from scratch to be more easily maintainable ([0f764d3](https://github.com/battis/oauth2-cli/commit/0f764d333135ae70bd9b3c4433b7c4a2ef757979))

## [0.5.11](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.5.10...qui-cli-plugin/0.5.11) (2026-01-20)

### Bug Fixes

- further token managment debugging output ([fda83da](https://github.com/battis/oauth2-cli/commit/fda83da8794d2f7b7221224619b34148ae0a8fe1))

## [0.5.10](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.5.9...qui-cli-plugin/0.5.10) (2026-01-18)

### Bug Fixes

- include @qui-cli/log as peer ([422eb25](https://github.com/battis/oauth2-cli/commit/422eb252fb778e8e12c9fe2ecc0d889ed8e82a0a))

## [0.5.9](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.5.8...qui-cli-plugin/0.5.9) (2026-01-17)

### Bug Fixes

- debug request/response/JSON from Client rather than plugin ([2ed73e1](https://github.com/battis/oauth2-cli/commit/2ed73e18089ffed4fe75d717d523fc86e2ae7f91))

## [0.5.8](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.5.7...qui-cli-plugin/0.5.8) (2026-01-17)

### Features

- add debugging output for requests ([8066cab](https://github.com/battis/oauth2-cli/commit/8066cabf56521f43ff90af21edabd9c20997e4cb))

## [0.5.7](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.5.6...qui-cli-plugin/0.5.7) (2026-01-17)

### Bug Fixes

- include scope param ([abf53c1](https://github.com/battis/oauth2-cli/commit/abf53c156a226e51c771a405058640a380407813))

## [0.5.6](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.5.5...qui-cli-plugin/0.5.6) (2026-01-15)

### Bug Fixes

- correctly implement template Client type ([ed6ac1c](https://github.com/battis/oauth2-cli/commit/ed6ac1cc63b1c41eceb93311105a1f61890a07c8))

## [0.5.5](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.5.4...qui-cli-plugin/0.5.5) (2026-01-15)

### Bug Fixes

- getClient() should return the type instantiated by instiateClient() ([46a4507](https://github.com/battis/oauth2-cli/commit/46a450707954917e1f55595fb3e35f0a62f475fc))

## [0.5.4](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.5.3...qui-cli-plugin/0.5.4) (2026-01-15)

### Bug Fixes

- export EnvironmentStorage from class as well as module ([01cb4ea](https://github.com/battis/oauth2-cli/commit/01cb4eaf54beebd16870adbb1b2664b4e585b14f))

## [0.5.3](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.5.2...qui-cli-plugin/0.5.3) (2026-01-15)

### Bug Fixes

- instantiateClient() _returns_ the client ([a302fdb](https://github.com/battis/oauth2-cli/commit/a302fdba916f68756b24319d432cc6adce09a1ba))

## [0.5.2](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.5.1...qui-cli-plugin/0.5.2) (2026-01-15)

### Features

- allow injection of custom oauth2-cli Client implementations via instantiateClient() ([cb1b94f](https://github.com/battis/oauth2-cli/commit/cb1b94fb1891343f00b5793fd6f7db33e6489c14))
- re-export all of oauth2-cli under the plugin module/class namespaces ([0cbdafc](https://github.com/battis/oauth2-cli/commit/0cbdafc84853f4a904e33640b65e4f0300f00b4a))

## [0.5.1](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.5.0...qui-cli-plugin/0.5.1) (2026-01-15)

### Bug Fixes

- implement convenience methods as methods, not properties ([a3f67fe](https://github.com/battis/oauth2-cli/commit/a3f67fecde50ae19d8cf960fe6828623e745126b))

## [0.5.0](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.4.3...qui-cli-plugin/0.5.0) (2026-01-14)

### ⚠ BREAKING CHANGES

- move to currently active Node.js v24
- consistent parameter names and URL support links

### Features

- add configurable hints for CLI option parameters ([b78ab2b](https://github.com/battis/oauth2-cli/commit/b78ab2b894a7807e2fced4531930c648fe275304))
- configurable opt names to avoid collision with multiple APIs ([d147e3e](https://github.com/battis/oauth2-cli/commit/d147e3e9dfce1f0f4629d5a0e7f649258b7e9487))
- consistent parameter names and URL support links ([671c371](https://github.com/battis/oauth2-cli/commit/671c3715c7218ab3b92e84a6da69835c5148462a))

### Bug Fixes

- export pre-registered plugin as an EJS module ([19b232e](https://github.com/battis/oauth2-cli/commit/19b232e5c65de4fd43fa604c8a3c38718d4a7ab9))
- move to currently active Node.js v24 ([a651159](https://github.com/battis/oauth2-cli/commit/a6511594460c7fbc9f59e8a86c6b2f17bfb3564e))

## [0.4.3](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.4.2...qui-cli-plugin/0.4.3) (2026-01-12)

### Bug Fixes

- more generous peer dependencies ([38cbed2](https://github.com/battis/oauth2-cli/commit/38cbed28d1046fafe73c9458f3a2f3a3799afaa9))

## [0.4.2](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.4.1...qui-cli-plugin/0.4.2) (2026-01-04)

### Bug Fixes

- typo in fetchJSON name ([a19ba97](https://github.com/battis/oauth2-cli/commit/a19ba9700e32a69f7714a428b3c5c60739a11c16))

## [0.4.1](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.4.0...qui-cli-plugin/0.4.1) (2026-01-04)

## [0.4.0](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.3.4...qui-cli-plugin/0.4.0) (2026-01-04)

### ⚠ BREAKING CHANGES

- rename for simplicity

### Features

- rename for simplicity ([110c415](https://github.com/battis/oauth2-cli/commit/110c415d03ef06c0d777ffea5c4cdd9d04a068eb))

## [0.3.4](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.3.3...qui-cli-plugin/0.3.4) (2026-01-03)

### Bug Fixes

- export ConfigurationProposal ([3c558c2](https://github.com/battis/oauth2-cli/commit/3c558c2dda012872747cf74fb76dcdd2740f04c6))

## [0.3.3](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.3.2...qui-cli-plugin/0.3.3) (2026-01-03)

### Bug Fixes

- export request param types ([244f588](https://github.com/battis/oauth2-cli/commit/244f5886148721f2be06c5da5b3a659fa17391da))

## [0.3.2](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.3.1...qui-cli-plugin/0.3.2) (2026-01-03)

### Bug Fixes

- export Credentials ([a175394](https://github.com/battis/oauth2-cli/commit/a1753947d1119e2810d22275c6fbca27b0b19db5))

## [0.3.1](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.3.0...qui-cli-plugin/0.3.1) (2026-01-03)

### Features

- extend @oauth2-cli/qui-cli-plugin by instantiating new versions ([14713c5](https://github.com/battis/oauth2-cli/commit/14713c5d1c884c9a1d62ca34d0e5c364ffd8f19b))

## [0.3.0](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.2.7...qui-cli-plugin/0.3.0) (2025-12-24)

### ⚠ BREAKING CHANGES

- resolve 1Password secret references successfully

### Bug Fixes

- resolve 1Password secret references successfully ([c4446e1](https://github.com/battis/oauth2-cli/commit/c4446e197a66271dac3ea8d58ff44725cc6be1db))

## [0.2.7](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.2.6...qui-cli-plugin/0.2.7) (2025-12-23)

### Bug Fixes

- remove overriding default redirect_uri ([2268428](https://github.com/battis/oauth2-cli/commit/2268428bf461b3b92301dde9767558ba3ab5f2f5))

## [0.2.6](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.2.5...qui-cli-plugin/0.2.6) (2025-12-23)

## [0.2.5](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.2.4...qui-cli-plugin/0.2.5) (2025-12-23)

### Bug Fixes

- expose headers configuration ([bac6bcb](https://github.com/battis/oauth2-cli/commit/bac6bcbf351155472494b82ad620f6b4bc19a1e6))

## [0.2.4](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.2.3...qui-cli-plugin/0.2.4) (2025-12-23)

### Bug Fixes

- more aggressively fix typing for partial configuration ([97f7e0c](https://github.com/battis/oauth2-cli/commit/97f7e0c034202fb26654677b5a3a836ff989b116))

## [0.2.3](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.2.2...qui-cli-plugin/0.2.3) (2025-12-23)

### Bug Fixes

- allow partial override of environment variable names and suppressed opt args ([c8a118b](https://github.com/battis/oauth2-cli/commit/c8a118ba6dae62f29549ef272448a4a6adea553c))

## [0.2.2](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.2.1...qui-cli-plugin/0.2.2) (2025-12-23)

### Features

- add optional typing to requestJSON() ([5f7cf39](https://github.com/battis/oauth2-cli/commit/5f7cf39d8dc0ca86cbe3df7e8493d3273e630573))
- configurable options and usage ([aadbc4b](https://github.com/battis/oauth2-cli/commit/aadbc4bffc9eda241763ecd9f134963517250e5f))
- default suppress token path storage ([9df7f4f](https://github.com/battis/oauth2-cli/commit/9df7f4f6312713e2086366350f0c546a975b2c31))
- provide EnvironmentStorage implementation ([55fc676](https://github.com/battis/oauth2-cli/commit/55fc676716fa1e4830a6a890b6d0bf5cecf0f57f))

### Bug Fixes

- update to current [@qui-cli](https://github.com/qui-cli) versions ([d54c521](https://github.com/battis/oauth2-cli/commit/d54c5210e55586ed688afa42840ec2b9e1cffeb0))

## [0.2.1](https://github.com/battis/oauth2-cli/compare/qui-cli-plugin/0.2.0...qui-cli-plugin/0.2.1) (2025-09-11)

### Bug Fixes

- update dependencies to address transient openid-client config error ([f0ca9a8](https://github.com/battis/oauth2-cli/commit/f0ca9a8d2bb4551b80a49e48aa43df5ba66a5a9b))

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
