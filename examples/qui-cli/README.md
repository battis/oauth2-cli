# `@oauth2-cli/qui-cli` plugin usage examples

## Working inside this monorepo

These examples are packages within a larger monorepo. The monorepo is configured to use [pnpm](https://pnpm.io/) as the package manager and [lerna](https://lerna.js.org/) as the build manager. To run these examples or compile the packages from source:

```bash
git clone git@github.com:battis/oauth2-cli.git path/to/repo
cd path/to/repo
pnpm install
pnpm run build
```

That is: clone the repo, set the repo as the current directory, install dependencies, and build the packages in the repo.

<!-- begin examples-toc -->

## [01 basic-use](./01%20basic-use#readme)

Use the qui-cli plugin to build a CLI app

## [02 configure-options](./02%20configure-options#readme)

Configure the `OAuth2` plugin to customize parameters and variables.

## [03 token-env-storage](./03%20token-env-storage#readme)

Store the `refresh_token` in the environment.

## [04 1password-integration](./04%201password-integration#readme)

Secure the local environment by using 1Password secret references.

## [05 multiple-apis](./05%20multiple-apis#readme)

Configure multiple instances of `OAuth2Plugin` to work with multiple APIs.

<!-- end examples-toc -->

## Structuring `qui-cli` apps

Each of these examples is packaged as an installable, runnable app:

- `directories` are defined in package.json (one could just define `bin`, but this way is more flexible).
- `bin/<command-name>` is executable, has a shebang, and imports the compiled script.
- [`@qui-cli`](https://www.npmjs.com/search?q=%40qui-cli) plugins are available for quick integration into the app.
- `src/index.ts` includes a call to `await Core.run()` to initialize the `qui-cli` system before the script logic.
