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
const drive = new Client({
  credentials: {
    issuer: 'https://accounts.google.com',
    client_id,
    client_secret,
    redirect_uri,
    scope: 'https://www.googleapis.com/auth/drive.metadata.readonly'
  },
  base_url: 'https://www.googleapis.com//drive/v3'
});

// list the user's files in Google Drive
console.log(await drive.requestJSON('/files'));
