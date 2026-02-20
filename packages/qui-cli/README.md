# @oauth2-cli/qui-cli

@qui-cli/plugin wrapper for oauth2-cli

[![npm version](https://badge.fury.io/js/@oauth2-cli%2Fqui-cli.svg)](https://badge.fury.io/js/@oauth2-cli%2Fqui-cli)
[![Module type: ESM](https://img.shields.io/badge/module%20type-esm-brightgreen)](https://nodejs.org/api/esm.html)

## Install

```sh
npm install @qui-cli/core @oauth2-cli/qui-cli
```

## Usage

`index.ts`

```ts
import { OAuth2 } from '@oauth2-cli/qui-cli';
import { Core } from '@qui-cli/core';

// configure a client name and a reason for authorizing access (recommended)
OAuth2.configure({
  name: 'Example',
  reason: 'the README example'
});

// initialize the `qui-cli` framework, loading credentials from the environment
await Core.run();

// request an endpoint, triggering interactive authorization if necessary
console.log(await OAuth2.requestJSON('https://example.com/api/endpoint'));
```

Without additional configuration, `OAuth2` will look for `ISSUER`, `CLIENT_ID`, `CLIENT_SECRET`, `REDIRECT_URI`, `AUTHORIZATION_ENDPOINT`, and `TOKEN_ENDPOINT` values in the environment and will attempt to configure the client using whichever subset of those values are present.

#### `name` and `reason`

It is strongly recommended that you provide a human-readable `name` for the client that will be used in user messages explaining _what_ is being accessed (e.g. the name of the API or service) and a human-readable `reason` for the user to provide this access (e.g. the name of your app or script). Messages are structured in the manner:

> ...to authorize access to `name` for `reason`, do this...

## Examples

Refer to [`oauth2-cli`](https://www.npmjs.com/package/oauth2-cli) for more information about configuring that tool in more nuanced ways.

Refer to [`qui-cli`](https://github.com/battis/qui-cli#readme) for more information about using those tools to build command line apps.

Specific examples of usage of this plugin are available in the [examples](https://github.com/battis/oauth2-cli/tree/main/examples/qui-cli#readme) directory of the repo.
