import * as Configuration from '@battis/oauth2-configure';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import open from 'open';
import * as client from 'openid-client';

type Options = Configuration.Options & {
  authorization_url: string;
  redirect_uri: string;
  headers?: Record<string, string>;
  code_verifier?: string;
  state?: string;
  resolve: Function;
  reject: Function;
  views?: string;
};

export async function redirectServer(options: Options) {
  const {
    authorization_url,
    redirect_uri,
    code_verifier,
    state,
    headers,
    resolve,
    reject,
    views = '../views'
  } = options;
  const redirectUrl = new URL(redirect_uri);

  const configuration = await Configuration.acquire(options);

  const app = express();
  const port = redirectUrl.port !== '' ? redirectUrl.port : 80;
  const server = app.listen(port);
  const ejs = await import('ejs');
  let view = 'complete.ejs';
  let tokens: client.TokenEndpointResponse | undefined = undefined;
  let error: any = undefined;

  app.get('/authorize', async (req, res) => {
    let viewPath = path.resolve(import.meta.dirname, views, 'authorize');
    if (ejs && fs.existsSync(viewPath)) {
      res.send(await ejs.renderFile(viewPath));
    } else {
      res.redirect(authorization_url);
    }
  });
  app.get(redirectUrl.pathname, async (req, res) => {
    try {
      const currentUrl = new URL(req.originalUrl, redirect_uri);
      tokens = await client.authorizationCodeGrant(
        configuration,
        currentUrl,
        {
          pkceCodeVerifier: code_verifier,
          expectedState: state
        },
        // @ts-ignore FIXME undocumented arg pass-through to oauth4webapi
        { headers }
      );
    } catch (e) {
      error = e;
      view = 'error.ejs';
    }
    if (!tokens && !error) {
      error = 'No tokens received in response to authorization code';
    }
    if (ejs) {
      res.send(
        await ejs.renderFile(path.resolve(import.meta.dirname, views, view), {
          tokens,
          error
        })
      );
    } else {
      res.send(error || 'You may close this window.');
    }
    server.close();
    if (error) {
      reject(error);
    } else {
      resolve(tokens);
    }
  });
  app.get('*', (_, res) => {
    res.status(404).send();
  });

  open(`http://localhost:${port}/authorize`);
}
