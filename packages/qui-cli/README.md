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

// initialize the `qui-cli` framework, ideally loading
await Core.run();

console.log(
  await OAuth2.requestJSON('https://api.github.com/repos/battis/oauth2-cli')
);
```

This assumes that the API credentials are stored in the environment, typically in `CLIENT_ID`, `CLIENT_SECRET`, and `REDIRECT_URI`. The request made to a path rather than a fully-qualified URL is possible if `ISSUER` is also defined. Optionally, an `ACCESS_TOKEN` can be stored in the environment for reuse on future calls.

Once compiled, the plugin can be invoked as a command line app, for example getting the usage instructions (built by `qui-cli` automatically from installed plugins)

```bash
node dist/index.js -h
```

Alternatively, the credentials can be passed directly through the command line:

```bash
node dist/index.js --clientId <...> --clientSecret <...> --redirectUri http://localhost:3000/redirect --issuer https://example.com
```

Another option is to pass the credentials as part of the plugin configuraton, before the app runs:

```ts
import { OAuth2 } from '@oauth2-cli/qui-cli';
import { Core } from '@qui-cli/core';

OAuth2.confgure({
  credentials: {
    authorization_endpoint: 'https://github.com/login/oauth/authorize',
    token_endpoint: 'https://github.com/login/oauth/access_token'
  }
});

await Core.run();

console.log(
  await OAuth2.requestJSON('https://api.github.com/repos/battis/oauth2-cli')
);
```
