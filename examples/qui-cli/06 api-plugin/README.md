# Build re-usable @qui-cli/plugins that provide pre-configured access to a specific API

This pair of packages demonstrates the creation of a reusable plugin that is pre-configured to provide access to a particular API.

- [plugin-consumer](./plugin-consumer/src/index.ts) is identical to the [base-use](../01%20basic-use#readme) app example, except that it using a pre-configured plugin that provides a `GitHub` object to access the API.
- [plugin-provider](./plugin-provider/src/) packages the plugin for reuse.
  - [`GitHubPlugin.ts`](./plugin-provider/src/GitHubPlugin.ts) extends `OAuth2Plugin` to be pre-configured to access the GitHub API.
  - [`GitHub.ts](./plugin-provider/src/GitHub.ts) exports a auto-registered instance of the plugin, along with a handful of unnecessary (but nice-to-have) convenience functions.
  - ['Extend.ts](./plugin-provider/src/Extend.ts) replicates the structure of `@oauth2-cli/qui-cli` exporting the two classes meant to be extended (the plugin and the client). In this case, the `Client` is re-exported unchanged.
  - [`index.ts`](./plugin-provider/src/index.ts) exports everything for easy consumption: re-exporting `'@oauth2-cli/qui-cli/dist/Export.js'`, exporting `./Extend.js`, and exporting the auto-registered plugin for quick use.

## Usage

Working within the [plugin-consumer](./plugin-consumer/) package…

Configure `.env` using [`.env.example`](./plugin-consumer/.env.example) for guidance.

Command-line usage information is available from the app with theh `-h` flag:

```bash
./bin/plugin-consumer -h
```

...and the app can be run by invoking it directly:

```bash
./bin/plugin-consumer
```
