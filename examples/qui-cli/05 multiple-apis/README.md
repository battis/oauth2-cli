# Configure multiple instances of `OAuth2Plugin` to work with multiple APIs

This [app](./src/index.ts) is identical to the [configure-options](../02%20configure-options#readme) app, with the addition of a second API configuration. Note that the `OAuth2Plugin` is imported directly from `'@oauth2-cli/qui-cli/dist/OAuth2Plugin.js'` to _avoid_ the default instance of the plugin also being registered. Each of the (unsuppressed) credential parameters needs to be uniquely named.

_Note that each of the `redirect_uri` values are directed to different ports. Due to timing issues, while it is *possible* that the two authorizations might not overlap, it is nonetheless quite likely that they *will*, and the redirects will cross paths. Use a different port for each API._

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
