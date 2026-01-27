# Control when authorization happens

This [script](./src/index.ts) is identical to the [basic-use](../01%20basic-use#readme), however the Client `authorize()` method is invoked prior to making API requests. This allows the script to, for example, front-load all API authorizations at the start of the script, rather than waiting to authorize access as-needed when the actual API requests are made -- particularly useful for long-running scripts.
