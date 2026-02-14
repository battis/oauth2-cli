# Use `ejs` as a peer

This [script](./src/index.ts) is identical to the [basic-use](../01%20basic-use#readme) example (authorize GitHub API access and request this repo), but the peer dependency [ejs](https://www.npmjs.com/package/ejs) is installed, which provides [Bootstrap](https://getbootstrap.com/)-styled web pages in the browser during the Authorization Code flow.

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
