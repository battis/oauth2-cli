# Store access tokens between runs

This [script](./src/index.ts) is identical to the [basic-use](../01%20basic-use#readme), however a `Token.FileStorage` instance is provided to the client to store the token in a local file between runs.

_Note that storing the token in plain text on the local file system is insecure. Ideally, only the refresh token is stored, and it is stored encrypted. A better approach is to take advantage of the [@oauth2-cli/qui-cli](https://www.npmjs.com/package/@oauth2-cli/qui-cli) plugin's integration with 1Password, for example. However the file storage may be appropriate in certain limited use cases._
