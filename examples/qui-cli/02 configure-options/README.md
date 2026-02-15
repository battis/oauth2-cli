# Configure the `OAuth2` plugin to customize parameters and variables

This [app](./src/index.ts) is identical to the [basic-use](../01%20basic-use#readme) app, but the configuration of the `OAuth2` plugin is demonstrated. Command line options and environment variables can be renamed to match API naming conventions or to differentiate between multiple APIs (see [multiple-apis](../05%20multiple-apis#readme) for more detail on this). In addition pre-configured or inapplicable options can be suppressed in the app to avoid confusion.

## Usage

Install package dependencies and compile the example:

```bash
npm install
npm run build
```

Configure `.env` using [`.env.example`](./.env.example) for guidance.

Command-line usage information is available from the app with theh `-h` flag:

```bash
./bin/configure-options -h
```

...and the app can be run by invoking it directly:

```bash
./bin/configure-options
```
