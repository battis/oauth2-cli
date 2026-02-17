import { GitHub } from '@examples/qui-cli_api-plugin_plugin-provider';
import { Core } from '@qui-cli/core';
import { Log } from '@qui-cli/log';
import { Root } from '@qui-cli/root';

// only necessary because we're in a monorepo and qui-cli _really_ wants to be at the root of it!
Root.configure({ root: process.cwd() });

// initialize qui-cli and the GitHub plugin from the environment and command line
await Core.run();

// get this repo (battis/oauth2-cli)
Log.info({
  response: await GitHub.requestJSON('/repos/battis/oauth2-cli')
});
