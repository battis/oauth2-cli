import cli from '@battis/qui-cli';
import ejs from 'ejs';
import express from 'express';
import crypto from 'node:crypto';
import path from 'node:path';
import open from 'open';
import { authorizationUrl, tokenUrl } from './URLs.js';
import {
  StorableToken,
  TokenError,
  TokenResponse,
  isTokenError
} from './tokens.js';

export type Credentials = {
  client_id: string;
  client_secret: string;
  'Bb-api-subscription-key': string;
  redirect_uri: string;
};

export async function authorize({
  client_id,
  client_secret,
  redirect_uri,
  ...subscriptionHeader
}: Credentials): Promise<StorableToken> {
  return new Promise((resolve, reject) => {
    const spinner = cli.spinner();
    spinner.start('Please authorize this app in your web browser');
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

    const state = crypto.randomUUID();

    const app = express();
    const server = app.listen(redirectUri.port);
    const timestamp = Date.now();
    let rejection: unknown = undefined;
    let response: TokenResponse | TokenError;

    app.get(redirectUri.pathname, async (req, res) => {
      if (req.query.error) {
        rejection = req.query.error;
      }
      if (!rejection && req.query.state !== state) {
        rejection = 'State mismatch.';
      }
      if (!rejection && req.query.code) {
        try {
          response = await (
            await fetch(tokenUrl, {
              method: 'POST',
              headers: subscriptionHeader,
              // sending as form data
              body: new URLSearchParams({
                client_id,
                client_secret,
                redirect_uri,
                code: req.query.code.toString(),
                grant_type: 'authorization_code'
              })
            })
          ).json();
          if (isTokenError(response)) {
            rejection = response;
          }
        } catch (error) {
          rejection = error;
        }
      } else {
        rejection = 'No code present';
      }
      res.send(
        await ejs.renderFile(
          path.join(
            import.meta.dirname,
            rejection ? 'views/error.ejs' : 'views/close.ejs'
          ),
          { rejection }
        )
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

    open(
      `${authorizationUrl}?${new URLSearchParams({
        client_id,
        response_type: 'code',
        state,
        redirect_uri
      })}`
    );
  });
}
