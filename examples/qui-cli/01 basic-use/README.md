# Use the qui-cli plugin to build a CLI app

This [app](./src/index.ts) is identical to the [oauth2-cli basic-use](../../oauth2-cli/01%20basic-use#readme) script, except it's written taking advantage of the [@oauth2-cli/qui-cli](https://www.npmjs.com/package/@oauth2-cli/qui-cli) plugin for [qui-cli](https://github.com/battis/qui-cli#readme) command line app development. All configuration values are drawn directly from the environment.

## Usage

Install package dependencies and compile the example:

```bash
npm install
npm run build
```

Configure `.env` using [`.env.example`](./.env.example) for guidance.

Command-line usage information is available from the app with theh `-h` flag:

```bash
./bin/basic-usage -h
```

...and the app can be run by invoking it directly:

```bash
./bin/basic-usage
```
