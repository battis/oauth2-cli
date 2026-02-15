# Store the `refresh_token` in the environment

This [app](./src/index.ts) is identical to the [basic-use](../01%20basic-use#readme) app, but `EnvironmentStorage` is used to store the APIs refresh token in the environment. See [1password-integraton](../04%201password-integration#readme) for more on how to enhance the security of this approach.

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
