# 1Password secret references in the environment

This [script](./src/index.ts) is identical to the [qui-ci](../061%20qui-cli#readme), a single additional dependency, [@1password/sdk](https://www.npmjs.com/package/@1password/sdk) has been added. Its presence enables the [@qui-cli/env](https://www.npmjs.com/package/@qui-cli/env) (included as part of the `qui-cli` plugin) to leverage 1Password's secure vault for secret storage. Note that the secrets are stored as 1Password secret references.

_Read more about 1Password secret reference in the environment in [their documentation](https://developer.1password.com/docs/) and [@qui-cli/env's documentation](https://github.com/battis/qui-cli/tree/main/packages/env#1password-integration)._
