# Persist `refresh_token` between runs of the script

This [script](./src/index.ts) is identical to the [ejs-optional](../02%20ejs-optional#readme) example (authorize GitHub API access and request this repo), but a `Token.FileStorage` instance is provided to the client to store the `refresh_token` in a local file between runs.

_Note that storing the token in plain text on the local file system is insecure. Ideally, only the refresh token is stored, and it is stored encrypted. A better approach is to take advantage of the [@oauth2-cli/qui-cli](https://www.npmjs.com/package/@oauth2-cli/qui-cli) plugin's integration with 1Password, for example. However the file storage may be appropriate in certain limited use cases._

## Usage

Install package dependencies and compile the example:

```bash
npm install
npm run build
```

Configure `.env` using [`.env.example`](./.env.example) for guidance.

Run the example script.

```bash
node ./dist/index.js
```
