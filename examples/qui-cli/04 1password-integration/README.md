# Secure the local environment by using 1Password secret references

This [app](./src/index.ts) is identical to the [configure-options](../02%20configure-options#readme) app, except [`@1password/sdk`](https://www.npmjs.com/package/@1password/sdk) is installed as a peer dependency of [`@qui-cli/env`](https://www.npmjs.com/package/@qui-cli/env), allowing 1Password secret references to be transparently accessed (and updated) in the environment.

## Usage

Configure `.env` using [`.env.example`](./.env.example) for guidance.

Command-line usage information is available from the app with theh `-h` flag:

```bash
./bin/1password-integration -h
```

...and the app can be run by invoking it directly:

```bash
./bin/1password-integration
```
