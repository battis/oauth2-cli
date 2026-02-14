# Inject header, search, and/or body parameters into API requests

This [script](./src/index.ts) is identical to the [basic-use](../01%20basic-use#readme) example (authorize GitHub API access and request this repo), but the `User-Agent` header `oauth2-cli` is injected into all requests to the API. Periodically developers will require additional forms of identification beyond standard OAuth 2.0 parameters, and these can be injected into API requests using `oauth2-cli`.

- `headers` are included in _every_ request
- `search` parameters are included in _every_ request
- `body` parameters are included in every request _that does not use the `GET` method_.

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
