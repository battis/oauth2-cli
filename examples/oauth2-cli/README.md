# `oauth2-cli` usage examples

When developing a more full-fledged command-line app, refer to the [`@oauth2-cli/qui-cli` examples](../qui-cli#readme).

<!-- begin examples-toc -->

## [01 basic-use](./01%20basic-use#readme)

Basic use of `oauth2-cli` to make authorized requests to an API.

## [02 openid-issuer](./02%20openid-issuer#readme)

Use an OpenID Connect issuer to acquire configuration information (with scope).

## [03 ejs-optional](./03%20ejs-optional#readme)

Add `ejs` (an optional peer dependency of `oauth2-cli`) to enable Bootstrap-styling of Authorization Code flow browser messages.

## [04 custom-views](./04%20custom-views#readme)

With `ejs` installed, override default views with custom instructions in the browser during the Authorization Code flow.

## [05 request-inject](./05%20request-inject#readme)

Inject header, search, and/or body parameters into API requests.

## [06 control-auth-timing](./06%20control-auth-timing#readme)

Control when in the logic of your script the user is asked to authorize API access (rather than waiting for the the first API request).

## [07 token-file-storage](./07%20token-file-storage#readme)

Persist `refresh_token` between runs of the script (see [qui-cli/04 token-env-storage](../qui-cli/03%@0token-env-storage#readme) for a more secure option).

<!-- end examples-toc -->

## Security note

While the `.env.example` file in each package demonstrates storing secrets in plain text in `.env` files (a traditional approach), the current trend is wisely to avoid storing secrets anywhere unencrypted. Using the [`@oauth2-cli/qui-cli`](https://www.npmjs.com/package/@oauth2-cli/qui-cli) plugin provides both a greater ease of use for developers and transparent integration of 1Password vaults for local development.

### `op` scripts

In each of the example packages, you will see a script named `op` which is what I actually use to test run the packages. It loads the `$OP_ACCOUNT` variable out of the `.env` file and then passes that to the 1Password CLI tool `op` to load the secret references stored in the `.env` file for use by the script.
