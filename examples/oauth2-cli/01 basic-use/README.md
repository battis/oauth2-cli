# Basic `oauth2-cli` Example

This [script](./src/index.ts) authenticates to and authorizes API access to the GitHub API. It loads the API credentials from the local `.env` file. It takes advantage of the automatic authorization in `oauth2-cli` to request this repository endpoint from the LMS.

Note that the example uses [dotenv](https://www.npmjs.com/package/dotenv) to load the local `.env` file into the process environment. _Do not include API credentials in your source code. Do not commit API credentials to repositories. Keep your API credentials secret._

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
