import { JSONValue } from '@battis/typescript-tricks';
import { Log } from '@qui-cli/log';
import * as OAuth2CLI from 'oauth2-cli';
import { Configuration, DPoPOptions, FetchBody } from 'openid-client';

export class Client extends OAuth2CLI.Client {
  protected async getConfiguration(): Promise<Configuration> {
    const config = await super.getConfiguration();
    Log.debug('OAuth 2.0 configuration', config);
    return config;
  }

  protected async authorize(): Promise<OAuth2CLI.Token | undefined> {
    Log.debug('Authorizing new access token');
    return await super.authorize();
  }

  protected async refreshToken(
    token: OAuth2CLI.Token
  ): Promise<OAuth2CLI.Token | undefined> {
    Log.debug('Refreshing expired access token', { token });
    const refreshed = await super.refreshToken(token);
    Log.debug('Received refreshed access token', { token: refreshed });
    return refreshed;
  }

  public async request(
    url: URL | string,
    method?: string,
    body?: FetchBody,
    headers?: Headers,
    dPoPOptions?: DPoPOptions
  ): Promise<Response> {
    Log.debug({ request: { method, url, headers, body, dPoPOptions } });
    const response = await super.request(
      url,
      method,
      body,
      headers,
      dPoPOptions
    );
    Log.debug({ response });
    return response;
  }

  public async requestJSON<T extends JSONValue = JSONValue>(
    url: URL | string,
    method?: string,
    body?: FetchBody,
    headers?: Headers,
    dPoPOptions?: DPoPOptions
  ): Promise<T> {
    const json = await super.requestJSON<T>(
      url,
      method,
      body,
      headers,
      dPoPOptions
    );
    Log.debug({ json });
    return json;
  }
}
