# Identify and traverse paginated API responses dynamically

This [script](./src/index.ts) is similar to the [basic-use](../01%20basic-use#readme) example (authorize GitHub API access and request this repo), but rather than requesting the repo information, the list of commits is requested. There are enough commits that the API paginates its response. [`GHClient`](./src/GHClient.ts) is an extension of the basic `Client` that identifies paginated responses (an array of data and a `link` header). [`GHPaginatedCollection`](./src/GHPaginatedCollection.ts) extends the base `PaginatedCollection` with a `nextPage()` method that parses the `link` header and uses the provided URL to request the next page of responses.

Note that `nextPage()` uses `fetchRaw()` in order to see the accompanying response headers and _then_ invokes `processResponse()` to parse the JSON data that will be returned. This is essentially identical to the usual `fetch()` method, but is necessary to access _both_ the data _and_ the response metadata.

## Usage

Configure `.env` using [`.env.example`](./.env.example) for guidance.

Run the example script.

```bash
node ./dist/index.js
```
