import * as Configuration from '@battis/oauth2-configure';
import express from 'express';
import path from 'node:path';
import * as client from 'openid-client';

type Options = Configuration.Options & {
  redirect_uri: string;
  headers?: Record<string, string>;
  code_verifier?: string;
  state?: string;
  resolve: Function;
  reject: Function;
};

export async function redirectServer(options: Options) {
  const { redirect_uri, code_verifier, state, headers, resolve, reject } =
    options;
  const redirectUrl = new URL(redirect_uri);

  const configuration = await Configuration.acquire(options);

  const app = express();
  const server = app.listen(redirectUrl.port !== '' ? redirectUrl.port : 80);
  const ejs = await import('ejs');
  let view = 'complete.ejs';
  let tokens: client.TokenEndpointResponse | undefined = undefined;
  let error: any = undefined;

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
        await ejs.renderFile(path.join(import.meta.dirname, '../views', view), {
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
}
