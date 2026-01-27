import input from '@inquirer/input';
import dotenv from 'dotenv';
import path from 'node:path';
import { Client, Token } from 'oauth2-cli';

// load credentials from environment
dotenv.config({ quiet: true });

// enter credentials manually if not found in environment
const issuer =
  process.env.ISSUER || (await input({ message: 'Issuer', required: true }));
const client_id =
  process.env.CLIENT_ID ||
  (await input({ message: 'Client ID', required: true }));
const client_secret =
  process.env.CLIENT_SECRET ||
  (await input({ message: 'Client Secret', required: true }));
const redirect_uri =
  process.env.REDIRECT_URI ||
  (await input({ message: 'Redirect URI', required: true }));

// configure oauth2-cli client with credentials
const canvas = new Client({
  credentials: { issuer, client_id, client_secret, redirect_uri },
  storage: new Token.FileStorage(
    // Note that an absolute path is required
    path.resolve(import.meta.dirname, '../var/token.json')
  )
});

// get the user profile
console.log(await canvas.requestJSON(`${issuer}/api/v1/users/self/profile`));
