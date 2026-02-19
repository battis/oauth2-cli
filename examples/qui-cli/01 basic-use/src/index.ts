import { OAuth2 } from '@oauth2-cli/qui-cli';
import { Core } from '@qui-cli/core';
import { Log } from '@qui-cli/log';
import { Root } from '@qui-cli/root';

// only necessary because we're in a monorepo and qui-cli wants to be at the root of it!
Root.configure({ root: process.cwd() });

// configure GitHub endpoints and human-readable name
OAuth2.configure({
  name: 'GitHub',
  credentials: {
    authorization_endpoint: 'https://github.com/login/oauth/authorize',
    token_endpoint: 'https://github.com/login/oauth/access_token'
  },
  base_url: 'https://api.github.com'
});

// initialize qui-cli and the OAuth2 plugin from the environment and command line
await Core.run();

// get this repo (battis/oauth2-cli)
Log.info({
  response: await OAuth2.requestJSON('/repos/battis/oauth2-cli')
});
