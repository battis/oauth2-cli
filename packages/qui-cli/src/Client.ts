import { JSONValue } from '@battis/typescript-tricks';
import { Colors } from '@qui-cli/colors';
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
    Log.debug(
      `Authorized ${this.name} new access token:\n${Log.syntaxColor(response)}`
    );
    return response;
  }

  public async handleAuthorizationCodeRedirect(
    request: Request,
    session: OAuth2CLI.Localhost.Server
  ): Promise<OAuth2CLI.Token.Response> {
    Log.debug(
      `Handling ${this.name} authorization code redirect:\n${Log.syntaxColor(request)}`
    );
    const response = await super.handleAuthorizationCodeRedirect(
      request,
      session
    );
    Log.debug(
      `Received ${this.name} authorization code response:\n${Log.syntaxColor(response)}`
    );
    return response;
  }

  protected async refreshTokenGrant({
    refresh_token,
    inject
  }: Parameters<OAuth2CLI.Client['refreshTokenGrant']>[0] = {}) {
    Log.debug(
      `Attempting to refresh ${this.name} access token:\n${Log.syntaxColor({ refresh_token, inject })}`
    );
    const refreshed = await super.refreshTokenGrant({ refresh_token, inject });
    if (refreshed) {
      Log.debug(
        `Received refreshed ${this.name} access token:\n${Log.syntaxColor(refreshed)}`
      );
    } else {
      Log.debug(`${this.name} token refresh failed`);
    }
    return refreshed;
  }

  protected async save(
    response: OAuth2CLI.Token.Response
  ): Promise<OAuth2CLI.Token.Response> {
    Log.debug(
      `Persisting ${this.name} refresh token (if present and storage configured):\n${Log.syntaxColor(response)}`
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
    Log.debug(
      `Sending request to ${this.name}:\n${Log.syntaxColor({
        request: { method, url, headers, body, dPoPOptions }
      })}`
    );
    const response = await super.request(
      url,
      method,
      body,
      headers,
      dPoPOptions
    );
    Log.debug(
      `Received response from ${this.name}:\n${Log.syntaxColor(response)}`
    );
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
    Log.debug(
      `Parsed JSON from ${this.name} response:\n${
        typeof json === 'object' && json
          ? Log.syntaxColor(json)
          : typeof json === 'string'
            ? Colors.quotedValue(`"${json}"`)
            : Colors.value(json)
      }`
    );
    return json;
  }
}
