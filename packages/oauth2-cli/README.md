# oauth2-cli

Acquire API access tokens via OAuth 2.0 within CLI tools

[![npm version](https://badge.fury.io/js/oauth2-cli.svg)](https://badge.fury.io/js/oauth2-cli)
[![Module type: ESM](https://img.shields.io/badge/module%20type-esm-brightgreen)](https://nodejs.org/api/esm.html)

## Install

```sh
npm i oauth2-cli
```

## Usage

```ts
import { Client, FileStorage } from 'oauth2-cli';

type ExpectedResponse = {
  value: string;
};

const client = new Client({
  client_id: 'm3C6dGQJPJrvgwN97mTP4pWVH9smZGrr',
  client_secret: '2XUktyxU2KQmQAoVHxQXNaHZ4G7XqJdP',
  redirect_uri: 'http://localhost:3000/example/redirect',
  authorization_endpoint: 'https://example.com/oauth2/auth',
  token_endpoint: 'https://example.com/oauth2/token',
  storage: new FileStorage('/path/to/token/file.json');
});
console.log(
  client.fetchJSON<ExpectedResponse>('https://example.com/path/to/api/endpoint')
);
```

Broadly speaking, having provided the configuration, the client is immediately ready to accept requests. If an stored access token is available, it will be used (and transparently refreshed as necessary, if possible). If no access token is available, the authorization flow will be triggered by the request, opening a browser window for the user to sign in and provide their authoriztion.

### Instantiate a `Client`

A `Client` requires some minimal information in order to interact with an OAuth 2.0 authorized API. The OAuth 2.0 base set is a `client_id`, `client_secret`, `authorization_endpoint`, `token_endpoint`, and a `redirect_uri`. For an OpenID-authenticated API, you could provide a `client_id`, `client_secret`, `issuer`, and `redirect_uri` and the Client will query the issuer for further details regarding required connection parameters (it is built on to of [openid-client](https://www.npmjs.com/package/openid-client)).

In both cases, the token can be persisted by passing an implementation of [`TokenStorage`](https://github.com/battis/oauth2-cli/blob/main/packages/oauth2-cli/src/Token/TokenStorage.ts), such as [`FileStorage`](https://github.com/battis/oauth2-cli/blob/main/packages/oauth2-cli/src/Token/FileStorage.ts) which expects a path to a location to store a JSON file of access token data. _There are more secure ways to store your tokens, such as [@oauth2-cli/qui-cli](https://www.npmjs.com/package/@oauth2-cli/qui-cli)'s [`EnvironmentStorage`](https://github.com/battis/oauth2-cli/blob/main/packages/qui-cli/src/EnvironmentStorage.ts) which can be linked to a [1Password vault](https://github.com/battis/qui-cli/tree/main/packages/env#1password-integration)._

#### `redirect_uri` to Localhost

Since the `redirect_uri` is receiving the authorization code in the Authorization Code token flow, the Client needs to be able to "catch" that redirect. The easy way to do this is to register a localhost address with the API (e.g. `http://localhost:3000/my/redirect/path`). When such a redirect URI is given to the client, it stands up (briefly) a local web server to receive that request at the port and path provided.

Not every API accepts a `localhost` redirect (it creates the possibility of CORS exploits that could lead to XSS vulnerabilities). For these APIs, using [gcrtl](https://github.com/battis/google-cloud-run-to-localhost#readme) or a similar system will work as well. (In the specific case of `gcrtl`, `oauth2-cli` will trim the leading `/http/localhost:<port>` from provided `redirect_uri` and expect the _remainder_ of the path.)

#### `http` protocol

If you would prefer an `https` connection to localhost, you have to roll your own SSL certificate.

### Request an endpoint

#### `request()`

As noted above, `oauth2-cli` is built on top of [openid-client](https://www.npmjs.com/package/openid-client). The `request()` method is a pass-through to the `openid-client` [fetchProtectedResource()](https://github.com/panva/openid-client/blob/b77d87c1e2f5fef6fab501de615fb83a74a0251f/docs/functions/fetchProtectedResource.md) function, with the configuration and accessToken managed by the Client.

```ts
class Client {
  // ...

  public async request(
    url: Req.URL.ish,
    method = 'GET',
    body?: OpenIDClient.FetchBody,
    headers: Req.Headers.ish = {},
    dPoPOptions?: OpenIDClient.DPoPOptions
  ) {
    // ...
  }
}
```

[`Req.URL.ish`](https://github.com/battis/oauth2-cli/blob/main/packages/oauth2-cli/src/Request/URL.ts#L3) and [`Req.Headers.ish`](https://github.com/battis/oauth2-cli/blob/main/packages/oauth2-cli/src/Request/Headers.ts#L1) are more forgiving types accepting not just those specific types, but reasonable facsimiles of them.

### `requestJSON<T>()`

Given that many APIs return JSON-formatted responses, it is convenient to just get that JSON (optionally pre-typed based on what you expect to receive) rather than having to process the response yourself.

```ts
class Client {
  // ...

  public async requestJSON<
    T extends OpenIDClient.JsonValue = OpenIDClient.JsonValue
  >(
    url: Req.URL.ish,
    method = 'GET',
    body?: OpenIDClient.FetchBody,
    headers: Req.Headers.ish = {},
    dPoPOptions?: OpenIDClient.DPoPOptions
  ) {
    // ...
  }
}
```

## Examples

[Refer to examples for more detailed usage.](https://github.com/battis/oauth2-cli/tree/main/examples/oauth2-cli#readme)
