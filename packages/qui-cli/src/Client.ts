import { JSONValue } from '@battis/typescript-tricks';
import { Log } from '@qui-cli/log';
import * as OAuth2CLI from 'oauth2-cli';
import type * as OpenIDClient from 'openid-client';
import * as requestish from 'requestish';

export class Client<
  C extends OAuth2CLI.Credentials = OAuth2CLI.Credentials
> extends OAuth2CLI.Client<C> {
  public async getConfiguration(): Promise<OpenIDClient.Configuration> {
    const creating = !this.config;
    const config = await super.getConfiguration();
    if (creating) {
      Log.debug(`${this.clientName()} OAuth 2.0 configuration created`, {
        credentials: this.credentials,
        config: {
          serverMetadata: config.serverMetadata(),
          clientMetadata: config.clientMetadata()
        }
      });
    }
    return config;
  }

  public async authorize(): Promise<OAuth2CLI.Token.Response> {
    Log.debug(`Authorizing ${this.clientName()} new access token`);
    const response = await super.authorize();
    Log.debug(`Authorized ${this.clientName()} new access token`, { response });
    return response;
  }

  protected async refreshTokenGrant(token: OAuth2CLI.Token.Response) {
    Log.debug(`Refreshing expired ${this.clientName()} access token`, {
      token
    });
    const refreshed = await super.refreshTokenGrant(token);
    Log.debug(`Received refreshed ${this.clientName()} access token`, {
      token: refreshed
    });
    return refreshed;
  }

  public async request(
    url: requestish.URL.ish,
    method?: string,
    body?: OpenIDClient.FetchBody,
    headers?: requestish.Headers.ish,
    dPoPOptions?: OpenIDClient.DPoPOptions
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

  public async requestJSON<J extends JSONValue = JSONValue>(
    url: requestish.URL.ish,
    method?: string,
    body?: OpenIDClient.FetchBody,
    headers?: requestish.Headers.ish,
    dPoPOptions?: OpenIDClient.DPoPOptions
  ): Promise<J> {
    const json = await super.requestJSON<J>(
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
