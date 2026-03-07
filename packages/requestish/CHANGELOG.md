# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [0.1.10](https://github.com/battis/oauth2-cli/compare/requestish/0.1.9...requestish/0.1.10) (2026-03-07)


### Features

* additional ish added to Body (entries array of JSONPrimitives) ([56fc8e0](https://github.com/battis/oauth2-cli/commit/56fc8e0b14a2f1c0af1ee1b232cf04073eb8175c))
* additional ish added to Headers (HeadersInit) ([b29e83b](https://github.com/battis/oauth2-cli/commit/b29e83b0d9cf4b45a110b0e43e941871ac572abf))
* allow undefined values in URLSearchParams.ish (treated as '') ([0f11898](https://github.com/battis/oauth2-cli/commit/0f1189889296d6175b7ef39f7e44e7e87ba3a8d7))
* concatenate() headers ([da0520b](https://github.com/battis/oauth2-cli/commit/da0520befe4e76decd107dff329bd0c8e3ea5383))
* concatenate() URLSearchParams.ish to not remove duplicates, undefined ([ed870ab](https://github.com/battis/oauth2-cli/commit/ed870abae4bc2d51ac6336095b311702b2ee6c7f))
* merge() now accepts an unlimited number URLSearchParams.ish ([62216c0](https://github.com/battis/oauth2-cli/commit/62216c08500594a937b18d13458e8403301264cc))


### Bug Fixes

* don't modify URL.ish strings when appending undefined URLSearchParams.ish ([c7d2fda](https://github.com/battis/oauth2-cli/commit/c7d2fdabd4f6b312ae0a91f44a9d0301251210ad))

## [0.1.9](https://github.com/battis/oauth2-cli/compare/requestish/0.1.8...requestish/0.1.9) (2026-03-06)


### Bug Fixes

* treat undefined as deleted ([e0d95e9](https://github.com/battis/oauth2-cli/commit/e0d95e9eb74fe84daa25aeb77d2a243248eae56f))

## [0.1.8](https://github.com/battis/oauth2-cli/compare/requestish/0.1.7...requestish/0.1.8) (2026-03-06)


### Bug Fixes

* treat undefined as a JSON primitive ('undefined') ([4d8caec](https://github.com/battis/oauth2-cli/commit/4d8caecfef3d3a5e7870e419b36a9efdde2a7d98))

## [0.1.7](https://github.com/battis/oauth2-cli/compare/requestish/0.1.6...requestish/0.1.7) (2026-03-06)


### Bug Fixes

* bump @battis/typescript-tricks to 0.7.8 ([228e155](https://github.com/battis/oauth2-cli/commit/228e1552a1ae368cc33344b487c9c08bda6ba01e))

## [0.1.6](https://github.com/battis/oauth2-cli/compare/requestish/0.1.5...requestish/0.1.6) (2026-03-06)


### Features

* increased "ish"ness of URLSearchParams to include constructable params ([64c49b2](https://github.com/battis/oauth2-cli/commit/64c49b2477e86077cf199a172e037cf22a7990c1))

## [0.1.5](https://github.com/battis/oauth2-cli/compare/requestish/0.1.4...requestish/0.1.5) (2026-03-05)


### Bug Fixes

* also allow Body to use URLSearchParams to accept JSON primitive values ([13f80c9](https://github.com/battis/oauth2-cli/commit/13f80c986a01e88f1f45c48873fdc10a58852a4b))

## [0.1.4](https://github.com/battis/oauth2-cli/compare/requestish/0.1.3...requestish/0.1.4) (2026-03-05)


### Features

* make URLSearchParams even more 'ish', accepting all JSON primitives ([b1c2a25](https://github.com/battis/oauth2-cli/commit/b1c2a25c29267c070070f7cd304bb31f854485e4))

## [0.1.3](https://github.com/battis/oauth2-cli/compare/requestish/0.1.2...requestish/0.1.3) (2026-02-20)

### Bug Fixes

- URLSearchParams.from() accepts undefined arg ([8f57912](https://github.com/battis/oauth2-cli/commit/8f5791285a03d5247a3897d666224e55368940b3))

## [0.1.2](https://github.com/battis/oauth2-cli/compare/requestish/0.1.1...requestish/0.1.2) (2026-02-19)

### Bug Fixes

- exporting types, so TS dependencies are not devDependencies ([a5f4dff](https://github.com/battis/oauth2-cli/commit/a5f4dff4536e54af9368851f65dded7e0d8cc50e))

## 0.1.0 (2026-02-16)
