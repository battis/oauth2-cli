# Use custom `ejs` templates

This [script](./src/index.ts) is identical to the [ejs-optional](../02%20ejs-optional#readme) example (authorize GitHub API access and request this repo), but a custom [authorize.ejs](./views/authorize.ejs) EJS template has been included and configured, which provides instructions and explanation to the user before launching the Authorization Code flow.

## Usage

Configure `.env` using [`.env.example`](./.env.example) for guidance.

Run the example script.

```bash
node ./dist/index.js
```
