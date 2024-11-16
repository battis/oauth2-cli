import cli from '@battis/qui-cli';
import express from 'express';
import crypto from 'node:crypto';
import path from 'node:path';
import open from 'open';
import { Options } from '../OAuth2.js';
import { Credentials } from './Credentials.js';
import {
  ServerError,
  StorableToken,
  TokenResponse,
  isServerError
} from './StorableToken.js';

export async function authorize(
  { client_id, client_secret, redirect_uri }: Credentials,
  { authorizationUrl, tokenUrl, headers }: Options
): Promise<StorableToken> {
  return new Promise(async (resolve, reject) => {
    const spinner = cli.spinner();
    if (!authorizationUrl) {
      throw new Error('Authorization URL must be defined');
    }
    const state = crypto.randomUUID();
    const url = `${authorizationUrl}?${new URLSearchParams({
      client_id,
      response_type: 'code',
      state,
      redirect_uri
    })}`;
    spinner.start(
      `Please authorize this app in your web browser: ${cli.colors.url(url)}`
    );
    const redirectUri = new URL(redirect_uri);
    if (
      redirectUri.hostname !== 'localhost' &&
      redirectUri.hostname !== '127.0.0.1'
    ) {
      throw new Error(
        `The redirect URL must be to ${cli.colors.url('localhost')} or equivalent (e.g. ${cli.colors.url(
          'http://localhost:3000/redirect'
        )})`
      );
    }

    const app = express();
    const server = app.listen(redirectUri.port || 80);
    const timestamp = Date.now();
    let rejection: unknown = undefined;
    let response: TokenResponse | ServerError;
    const ejs = await import('ejs');

    app.get(redirectUri.pathname, async (req, res) => {
      if (req.query.error) {
        rejection = req.query.error;
      }
      if (!rejection && req.query.state !== state) {
        rejection = 'State mismatch.';
      }
      if (!rejection && req.query.code) {
        try {
          response = (await (
            await fetch(tokenUrl || authorizationUrl, {
              method: 'POST',
              headers,
              // sending as form data
              body: new URLSearchParams({
                client_id,
                client_secret,
                redirect_uri,
                code: req.query.code.toString(),
                grant_type: 'authorization_code'
              })
            })
          ).json()) as TokenResponse | ServerError;
          if (isServerError(response)) {
            rejection = response;
          }
        } catch (error) {
          rejection = error;
        }
      } else {
        rejection = 'No code present';
      }
      res.send(
        ejs
          ? await ejs.renderFile(
              path.join(
                import.meta.dirname,
                rejection ? 'views/error.ejs' : 'views/close.ejs'
              ),
              { rejection }
            )
          : rejection
            ? rejection
            : 'Authorization complete. You may close this window.'
      );
      server.close();
      if (rejection) {
        spinner.fail('Could not authorize');
        reject(rejection);
      }
      spinner.succeed('Authorized');
      resolve({ timestamp, ...(response as TokenResponse) });
    });
    app.get('*', (_, res) => {
      res.status(404).send();
    });

    open(url);
  });
}
