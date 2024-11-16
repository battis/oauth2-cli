import { Mutex } from 'async-mutex';
import fs from 'node:fs';
import path from 'node:path';
import { authorize } from './authorize.js';
import { Credentials } from './Credentials.js';
import { Options } from './Options.js';
import {
  ServerError,
  StorableToken,
  TokenResponse,
  isServerError
} from './StorableToken.js';

const tokenMutex = new Mutex();

export async function getToken(credentials: Credentials, options: Options) {
  let { tokenPath } = options;
  if (tokenPath) {
    tokenPath = path.resolve(process.cwd(), tokenPath);
  }
  let tokens: StorableToken;
  let refreshed = true;
  return await tokenMutex.runExclusive(() => {
    return new Promise(async (resolve, reject) => {
      try {
        if (tokenPath && fs.existsSync(tokenPath)) {
          tokens = JSON.parse(fs.readFileSync(tokenPath).toString());
          if (hasExpired(tokens.timestamp, tokens.expires_in)) {
            tokens = await refreshToken(tokens, credentials, options);
          } else {
            refreshed = false;
          }
        } else {
          tokens = await authorize(credentials, options);
        }

        if (refreshed && tokenPath) {
          fs.mkdirSync(path.dirname(tokenPath), { recursive: true });
          storeTokens(tokenPath, tokens);
        }
        resolve(tokens);
      } catch (error) {
        reject(error);
      }
    });
  });
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
  credentials: Credentials,
  options: Options
): Promise<StorableToken> {
  if (!hasExpired(tokens.timestamp, tokens.refresh_token_expires_in)) {
    const { refresh_token } = tokens;
    const { client_id, client_secret } = credentials;
    const { authorizationUrl, tokenUrl, requestFormat, headers } = options;
    let body: Record<string, string> | string | URLSearchParams = {
      grant_type: 'refresh_token',
      refresh_token,
      client_id,
      client_secret
    };
    switch (requestFormat) {
      case 'application/json':
        body = JSON.stringify(body);
        break;
      case 'application/x-www-form-urlencoded':
      default:
        body = new URLSearchParams(body);
    }
    const timestamp = Date.now();
    const response = (await (
      await fetch(tokenUrl || authorizationUrl, {
        method: 'POST',
        headers,
        body
      })
    ).json()) as TokenResponse | ServerError;
    if (isServerError(response)) {
      throw new Error('Error refreshing token');
    }
    return { ...response, timestamp };
  }
  return authorize(credentials, options);
}
