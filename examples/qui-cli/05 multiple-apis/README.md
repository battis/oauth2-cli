# Configure multiple APIs at the same time

This [script](./src/index.ts) is extends to the [custom-qui-ci](../071%20custom-qui-cli#readme), but rather than importing the default `OAuth2` plugin instance, it instantiates two new instances of `OAuth2Plugin`: `canvas` and `sky` (note that the default package import is also bypassed in this case, to avoid registering the default `OAuth2` instance too@). These are each registered and configured separately.

_Due to timing issues inherent in starting up and shutting down the Express web server, it is advisable to make sure that the redirects for each API are hosted in *different* ports, as in the example._

## Usage

Install package dependencies and compile the example:

```bash
npm install
npm run build
```

Configure `.env` using [`.env.example`](./.env.example) for guidance.

Command-line usage information is available from the app with theh `-h` flag:

```bash
./bin/multiple-apis -h
```

...and the app can be run by invoking it directly:

```bash
./bin/multiple-apis
```
