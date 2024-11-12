import fs from 'node:fs';
import path from 'node:path';
import { authorize, Credentials } from './authorize.js';
import {
  isTokenError,
  StorableToken,
  TokenError,
  TokenResponse
} from './tokens.js';
import { tokenUrl } from './URLs.js';

export async function getToken(tokenPath: string, credentials: Credentials) {
  const resolvedPath = path.resolve(process.cwd(), tokenPath);
  let tokens: StorableToken;
  let refreshed = true;
  if (fs.existsSync(resolvedPath)) {
    tokens = JSON.parse(fs.readFileSync(resolvedPath).toString());
    if (hasExpired(tokens.timestamp, tokens.expires_in)) {
      tokens = await refreshToken(tokens, credentials);
    } else {
      refreshed = false;
    }
  } else {
    tokens = await authorize(credentials);
  }

  if (refreshed) {
    storeTokens(tokenPath, tokens);
  }

  return tokens;
}

function storeTokens(tokenPath: string, tokens: StorableToken) {
  fs.writeFileSync(
    path.resolve(process.cwd(), tokenPath),
    JSON.stringify(tokens)
  );
}

function hasExpired(timestamp: number, expires_in: number) {
  return Date.now() > timestamp + expires_in;
}

async function refreshToken(
  tokens: StorableToken,
  credentials: Credentials
): Promise<StorableToken> {
  if (!hasExpired(tokens.timestamp, tokens.refresh_token_expires_in)) {
    const { refresh_token } = tokens;
    const { client_id, client_secret, redirect_uri, ...subscriptionHeader } =
      credentials;
    const timestamp = Date.now();
    const response = (await (
      await fetch(tokenUrl, {
        method: 'POST',
        headers: subscriptionHeader,
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token,
          client_id,
          client_secret
        })
      })
    ).json()) as TokenResponse | TokenError;
    if (isTokenError(response)) {
      throw new Error('Error refreshing token');
    }
    return { ...response, timestamp };
  }
  return authorize(credentials);
}
