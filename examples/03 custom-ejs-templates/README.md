# Use custom `ejs` templates

This [script](./src/index.ts) is identical to the [basic-use](../01%20basic-use#readme), but the peer dependency [ejs](https://www.npmjs.com/package/ejs) is installed, which allows "nicer" web pages in the rediret web server.

Also, a custom [authorize template](./views/authorize.ejs) has been included and configured, which will provide instructions and explanation to the user before launching the API authorization.
