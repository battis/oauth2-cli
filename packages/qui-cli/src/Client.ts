import { JSONValue } from '@battis/typescript-tricks';
import { Log } from '@qui-cli/log';
import { Request } from 'express';
import * as OAuth2CLI from 'oauth2-cli';
import type * as OpenIDClient from 'openid-client';
import * as requestish from 'requestish';

/**
 * Wrap {@link https://www.npmjs.com/package/openid-client openid-client} in a
 * class instance specific to a particular OAuth/OpenID server credential-set,
 * abstracting away most flows into {@link getToken}
 *
 * Emits {@link Client.TokenEvent} whenever a new access token is received
 *
 * Provides optional debug logging output using
 * {@link https://www.npmjs.com/package/@qui-cli/env @qui-cli/env}
 */
export class Client<
  C extends OAuth2CLI.Credentials = OAuth2CLI.Credentials
> extends OAuth2CLI.Client<C> {
  public async getConfiguration(): Promise<OpenIDClient.Configuration> {
    const creating = !this.config;
    const config = await super.getConfiguration();
    if (creating) {
      Log.debug(`${this.name} OAuth 2.0 configuration created`, {
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
    Log.debug(`Authorizing ${this.name} new access token`);
    const response = await super.authorize();
    Log.debug(`Authorized ${this.name} new access token`, { response });
    return response;
  }

  public async handleAuthorizationCodeRedirect(
    request: Request,
    session: OAuth2CLI.Localhost.Server
  ): Promise<OAuth2CLI.Token.Response> {
    Log.debug(`Handling ${this.name} authorization code redirect`, { request });
    const response = await super.handleAuthorizationCodeRedirect(
      request,
      session
    );
    Log.debug(`Received ${this.name} authorization code response`, {
      response
    });
    return response;
  }

  protected async refreshTokenGrant(token: OAuth2CLI.Token.Response) {
    Log.debug(`Refreshing expired ${this.name} access token`, {
      token
    });
    const refreshed = await super.refreshTokenGrant(token);
    Log.debug(`Received refreshed ${this.name} access token`, {
      token: refreshed
    });
    return refreshed;
  }

  protected async save(
    response: OAuth2CLI.Token.Response
  ): Promise<OAuth2CLI.Token.Response> {
    Log.debug(
      `Persisting ${this.name} refresh token, if present and storage configured`,
      {
        response
      }
    );
    return await super.save(response);
  }

  public async request(
    url: requestish.URL.ish,
    method?: string,
    body?: OpenIDClient.FetchBody,
    headers?: requestish.Headers.ish,
    dPoPOptions?: OpenIDClient.DPoPOptions
  ): Promise<Response> {
    Log.debug(`Sending request to ${this.name}`, {
      request: { method, url, headers, body, dPoPOptions }
    });
    const response = await super.request(
      url,
      method,
      body,
      headers,
      dPoPOptions
    );
    Log.debug(`Received response from ${this.name}`, { response });
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
    Log.debug(`Parsed JSON from ${this.name} response`, { json });
    return json;
  }
}
