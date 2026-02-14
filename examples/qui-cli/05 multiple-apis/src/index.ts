import { OAuth2Plugin } from '@oauth2-cli/qui-cli/dist/OAuth2Plugin.js';
import { Core } from '@qui-cli/core';
import { Log } from '@qui-cli/log';
import { register } from '@qui-cli/plugin';
import { Root } from '@qui-cli/root';

// only necessary because we're in a monorepo and qui-cli _really_ wants to be at the root of it!
Root.configure({ root: process.cwd() });

// create an OAuth2Plugin instance for each API
const github = new OAuth2Plugin('github');
const drive = new OAuth2Plugin('google-drive');

// register all plugin instances with qui-cli
await register(github);
await register(drive);

// configure each instance
github.configure({
  credentials: {
    authorization_endpoint: 'https://github.com/login/oauth/authorize',
    token_endpoint: 'https://github.com/login/oauth/access_token'
  },
  man: { heading: 'GitHub API options' },
  opt: {
    client_id: 'ghClientId',
    client_secret: 'ghClientSecret',
    redirect_uri: 'ghRedirectUri',
    scope: 'ghScope'
  },
  env: {
    client_id: 'GITHUB_CLIENT_ID',
    client_secret: 'GITHUB_CLIENT_SECRET',
    redirect_uri: 'GITHUB_REDIRECT_URI'
  },
  suppress: {
    issuer: true,
    authorization_endpoint: true,
    token_endpoint: true
  }
});

drive.configure({
  credentials: {
    issuer: 'https://accounts.google.com',
    scope: 'https://www.googleapis.com/auth/drive.metadata.readonly'
  },
  man: { heading: 'Google Drive API options' },
  opt: {
    client_id: 'driveClientId',
    client_secret: 'driveClientSecret',
    redirect_uri: 'driveRedirectUri',
    scope: 'driveScope'
  },
  env: {
    client_id: 'GOOGLE_CLIENT_ID',
    client_secret: 'GOOGLE_CLIENT_SECRET',
    redirect_uri: 'GOOGLE_REDIRECT_URI'
  },
  suppress: {
    issuer: true,
    authorization_endpoint: true,
    token_endpoint: true
  }
});

await Core.run();
Log.info({
  repo:
    // get this repo (battis/oauth2-cli)
    await github.requestJSON('https://api.github.com/repos/battis/oauth2-cli'),
  files:
    // list the user's files in Google Drive
    await drive.requestJSON('https://www.googleapis.com/drive/v3/files')
});
