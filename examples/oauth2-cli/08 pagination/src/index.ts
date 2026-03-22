import dotenv from 'dotenv';
import path from 'node:path';
import { Token } from 'oauth2-cli';
import { GHClient } from './GHClient.js';
import { GHPaginatedCollection } from './GHPaginatedCollection.js';

// load credentials from the environment
dotenv.config({ quiet: true });

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const redirect_uri = process.env.REDIRECT_URI;

// require complete credential set
if (!(client_id && client_secret && redirect_uri)) {
  throw new Error('Inclomplete credential set found in environment.');
}

// configure oauth2-cli client with credentials
const github = new GHClient({
  name: 'GitHub',
  reason: 'the oauth2-cli token-file-storage example',
  credentials: {
    client_id,
    client_secret,
    redirect_uri,
    authorization_endpoint: 'https://github.com/login/oauth/authorize',
    token_endpoint: 'https://github.com/login/oauth/access_token'
  },
  base_url: 'https://api.github.com',
  storage: new Token.FileStorage(
    // Note that an absolute path is required
    path.resolve(import.meta.dirname, '../var/token')
  )
});

// get this repo (battis/oauth2-cli)
const response = await github.request('/repos/battis/oauth2-cli/commits');
if (response instanceof GHPaginatedCollection) {
  for await (const commit of response) {
    const message = commit.commit.message.split('\n').shift();
    console.log(
      `${commit.commit.author.date} ${commit.sha.substring(0, 7)} ${message.substring(0, 50)}${message.length > 50 ? '...' : ''} / ${commit.author.login}`
    );
  }
} else {
  throw new Error('Did not receive a paginated response.');
}
