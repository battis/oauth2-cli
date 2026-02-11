# Google Cloud Run to `localhost`

[![npm version](https://badge.fury.io/js/gcrtl.svg)](https://npmjs.com/package/gcrtl)
[![Module type: ESM](https://img.shields.io/badge/module%20type-esm-brightgreen)](https://nodejs.org/api/esm.html)

IAP-protected redirect to localhost running as a service on Google Cloud Run

## Integrating with `gcrtl` URLs

### Usage

```ts
import * as gcrtl from 'gcrtl';

console.log(gcrtl.path('http://localhost:3000/foo/bar')); // '/foo/bar'
console.log(gcrtl.port('http://localhost:3000/foo/bar')); // 3000

console.log(
  gcrtl.path('https://<gcrtl identifier>.run.app/http/localhost:3000/foo/bar')
); // '/foo/bar'
console.log(
  gcrtl.port('https://<gcrtl identifier>.run.app/http/localhost:3000/foo/bar')
); // 3000
```

…and when ports are not included in the URL, it falls back to the relevant protocils to identify the expected port.

## Running the app

### Install

Prerequisites: a Google Cloud account with billing enabled.

Clone the repo, install dev dependencies, and deploy:

```bash
git clone ssh://git@github.com/battis/google-cloud-run-to-localhost.git path/to/project
cd path/to/project
pnpm i -D
pnpm run deploy
```

## Configure

The initial deploy will configure a `.env` file appropriately to eliminate the interactive wizard for future deployments.

To give domain users access to the redirect tool, run deploy with `--user` flags:

```bash
cd path/to/project
./scripts/deploy --user user1@example.com --user user2@exampke.com
```

## Use

The resulting `run.app` URL can be used, for example, as an OAuth redirect URL for use with, for example, [oauth2-cli](https://www.npmjs.com/package/oauth2-cli). Set the OAuth redirect URL on the server to `https://<Cloud Run service subdomain>.run.app/http/localhost:3000/path/to/redirect` and it will be redirect to `http://localhost:3000/path/to/redirect` upon receipt.
