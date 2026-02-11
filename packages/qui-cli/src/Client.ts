import { Log } from '@qui-cli/log';
import * as OAuth2CLI from 'oauth2-cli';
import type {
  Configuration,
  DPoPOptions,
  FetchBody,
  JsonValue
} from 'openid-client';

export class Client extends OAuth2CLI.Client {
  public async getConfiguration(): Promise<Configuration> {
    const config = await super.getConfiguration();
    Log.debug('OAuth 2.0 configuration', config);
    return config;
  }

  public async authorize(): Promise<OAuth2CLI.Token.Response> {
    Log.debug('Authorizing new access token');
    return await super.authorize();
  }

  protected async refreshTokenGrant(
    token: OAuth2CLI.Token.Response
  ): Promise<OAuth2CLI.Token.Response> {
    Log.debug('Refreshing expired access token', { token });
    const refreshed = await super.refreshTokenGrant(token);
    Log.debug('Received refreshed access token', { token: refreshed });
    return refreshed;
  }

  public async request(
    url: OAuth2CLI.Request.URL.ish,
    method?: string,
    body?: FetchBody,
    headers?: OAuth2CLI.Request.Headers.ish,
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

  public async requestJSON<T extends JsonValue = JsonValue>(
    url: OAuth2CLI.Request.URL.ish,
    method?: string,
    body?: FetchBody,
    headers?: OAuth2CLI.Request.Headers.ish,
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
