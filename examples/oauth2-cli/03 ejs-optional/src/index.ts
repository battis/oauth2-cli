import dotenv from 'dotenv';
import { Client } from 'oauth2-cli';

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
const github = new Client({
  name: 'GitHub',
  credentials: {
    client_id,
    client_secret,
    redirect_uri,
    authorization_endpoint: 'https://github.com/login/oauth/authorize',
    token_endpoint: 'https://github.com/login/oauth/access_token'
  },
  base_url: 'https://api.github.com'
});

// get this repo (battis/oauth2-cli)
console.log(await github.requestJSON('/repos/battis/oauth2-cli'));
