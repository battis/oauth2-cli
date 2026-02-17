import { OAuth2 } from '@oauth2-cli/qui-cli';
import { Core } from '@qui-cli/core';
import { Log } from '@qui-cli/log';
import { Root } from '@qui-cli/root';

// only necessary because we're in a monorepo and qui-cli wants to be at the root of it!
Root.configure({ root: process.cwd() });

// configure the OAuth2 plugin
OAuth2.configure({
  // change the section header
  man: { heading: 'GitHub API options' },

  // request injection (see examples/oauth2-cli/05 request-inject)
  inject: {
    headers: {
      'User-Agent': 'oauth2-cli'
    }
  },

  // pre-configure non-secret credentials
  credentials: {
    authorization_endpoint: 'https://github.com/login/oauth/authorize',
    token_endpoint: 'https://github.com/login/oauth/access_token'
  },
  base_url: 'https://api.github.com',

  // change the name of command-line options (compare with examples/qui-cli/01 basic-use)
  opt: {
    client_id: 'githubClientId',
    client_secret: 'githubClientSecret',
    redirect_uri: 'githubRedirectUri',
    scope: 'githubScope'
  },

  // change the names of environment variables
  env: {
    client_id: 'GITHUB_CLIENT_ID',
    client_secret: 'GITHUB_CLIENT_SECRET',
    redirect_uri: 'GITHUB_REDIRECT_URI',
    scope: 'GITHUB_SCOPE'
  },

  // suppress display of command line options that are irrelevant or hard-coded
  suppress: {
    issuer: true,
    authorization_endpoint: true,
    token_endpoint: true
  }
});

// initialize qui-cli and the OAuth2 plugin from the environment and command-line
await Core.run();

// get this repo (battis/oauth2-cli)
Log.info({
  response: await OAuth2.requestJSON('/repos/battis/oauth2-cli')
});
