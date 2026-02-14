# Use the qui-cli plugin customized

This [script](./src/index.ts) is identical to the [qui-ci](../061%20qui-cli#readme), except the command line options and environment variable names have been configured to be specific to a particular (Canvas) API.

## Usage

Install package dependencies and compile the example:

```bash
npm install
npm run build
```

Configure `.env` using [`.env.example`](./.env.example) for guidance.

Command-line usage information is available from the app with theh `-h` flag:

```bash
./bin/token-env-storage -h
```

...and the app can be run by invoking it directly:

```bash
./bin/token-env-storage
```
