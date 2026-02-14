# Control when authorization happens

This [script](./src/index.ts) is identical to the [ejs-optional](../02%20ejs-optional#readme) example (authorize GitHub API access and request this repo), but the Client `authorize()` method is invoked prior to making API requests. This allows the script to, for example, front-load all API authorizations at the start of the script, rather than waiting to authorize access as-needed when the actual API requests are made -- particularly useful for long-running scripts.

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
