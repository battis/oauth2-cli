# Basic `oauth2-cli` Example

This [script](./src/index.ts) authenticates to and authorizes API access to the Canvas LMS API.

It loads the API credentials from the local `.env` file (and prompts the user to input them manually if they're not found.) It then takes advantage of the automatic authorization in `oauth2-cli` to request the user profile endpoint from the LMS.

_A more full-featured implementation of a Canvas LMS API client using this package can be found in [@oauth2-cli/canvas](https://www.npmjs.com/package/@oauth2-cli/canvas)._
