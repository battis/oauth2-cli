# Use an OpenID Connect issuer to acquire configuration information (with scope)

OpenID Connect is a layer added on top of OAuth 2.0 that provides an authentication layer as well as authorization. In addition, it uses a "well known" URL pattern to provide configuration information. Google, for example, supports OpenID. This script is similar to [01 basic-use](../01%20basic-use#readme), but rather than providing an `authorization_endpoint` and a `token_endpoint`, only an `issuer` URL is provided, from which the rest of the configuration is loaded.

In addition, this script demonstrates the use of authorization scopes (required by Google and other OAuth 2.0-authorized APIs).

## Usage

Configure `.env` using [`.env.example`](./.env.example) for guidance.

Run the example script.

```bash
node ./dist/index.js
```
