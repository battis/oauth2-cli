import * as Configuration from '@battis/oauth2-configure';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import open from 'open';
import * as OpenIDClient from 'openid-client';

const ejs = await import('ejs');

const portRegistry: (number | string)[] = [];

type Options = Configuration.Options & {
  authorization_url: string;
  redirect_uri: string;
  headers?: Record<string, string>;
  code_verifier?: string;
  state?: string;
  resolve: (tokens?: OpenIDClient.TokenEndpointResponse) => void;
  reject: (error: unknown) => void;
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
  let view = 'complete.ejs';
  let tokens: OpenIDClient.TokenEndpointResponse | undefined = undefined;
  let error: unknown = undefined;

  /*
   * FIXME Multiple clients with `redirect_uri` on the same localhost port
   *   This seems to be some sort of an issue with Express (or node http?) in
   *   which, despite a fresh invocation of express() for each redirect
   *   listener, every listener subsequent to the first _on the same port_
   *   retains the original routing stack of the first listener on that port.
   *   I have tried:
   *     - Setting a manual delay (up to 10 seconds) between the receipt of
   *       the token and resolving it to allow the server to close.
   *     - Using a mutex semaphore to ensure that no two instances of
   *       Localhost are running simultaneously
   *     - Separating the routing into a separate Router middleware
   *     - Manually removing the routing stack (which does, at least, break
   *       the routing of the subsequent instances, supporting the idea that
   *       the app is getting reused by Express)
   */
  if (portRegistry.includes(port)) {
    throw new Error(
      `Multiple OAuth clients are attempting to redirect to port ${port}. This will result in failure. Please reconfigure your credentials so that each client is redirecting to a distinct port on http://localhost (e.g. 3000, 3001, 3002)`
    );
  } else {
    portRegistry.push(port);
  }

  app.get('/authorize', async (req, res) => {
    const viewPath = path.resolve(import.meta.dirname, views, 'authorize');
    if (ejs && fs.existsSync(viewPath)) {
      res.send(await ejs.renderFile(viewPath));
    } else {
      res.redirect(authorization_url);
    }
  });
  app.get(redirectUrl.pathname, async (req, res) => {
    try {
      const currentUrl = new URL(req.originalUrl, redirect_uri);
      tokens = await OpenIDClient.authorizationCodeGrant(
        configuration,
        currentUrl,
        {
          pkceCodeVerifier: code_verifier,
          expectedState: state
        },
        // @ts-expect-error 2322 undocumented arg pass-through to oauth4webapi
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
  app.get('*path', (_, res) => {
    res.status(404).send();
  });

  open(`http://localhost:${port}/authorize`);
}
