# Build re-usable @qui-cli/plugins that provide pre-configured access to a specific API

This pair of packages demonstrates the creation of a reusable plugin that is pre-configured to provide access to a particular API.

- [plugin-consumer](./plugin-consumer/src/index.ts) is identical to the [base-use](../01%20basic-use#readme) app example, except that it using a pre-configured plugin that provides a `GitHub` object to access the API.
- [plugin-provider](./plugin-provider/src/) packages the plugin for reuse.
  - [`GitHubPlugin.ts`](./plugin-provider/src/GitHubPlugin.ts) extends `OAuth2Plugin` to be pre-configured to access the GitHub API, importing all components from the `Unregistered` namespace file in `@oauth2-cli/qui-cli` to avoid _also_ auto-registering the default plugin instance.
  - [`GitHub.ts](./plugin-provider/src/GitHub.ts) exports a auto-registered instance of the plugin, along with a handful of unnecessary (but nice-to-have) convenience functions.
  - [`index.ts`](./plugin-provider/src/index.ts) exports the auto-registered plugin as a namespace, for easy importing.

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
