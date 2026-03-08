import { JSONValue } from '@battis/typescript-tricks';
import { Colors } from '@qui-cli/colors';
import { Log } from '@qui-cli/log';
import { Request } from 'express';
import * as OAuth2CLI from 'oauth2-cli';
import type * as OpenIDClient from 'openid-client';
import { Body, Headers, URL } from 'requestish';

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
    const uninitialized = !this.config;
    const config = await super.getConfiguration();
    if (uninitialized) {
      Log.debug(
        `${this.name} OAuth 2.0 configuration initialized: ${Log.syntaxColor({
          credentials: this.credentials,
          config: {
            serverMetadata: config.serverMetadata(),
            clientMetadata: config.clientMetadata()
          }
        })}`
      );
    }
    return config;
  }

  public async authorize(): Promise<OAuth2CLI.Token.Response> {
    Log.debug(`Authorizing ${this.name} new access token`);
    const response = await super.authorize();
    Log.debug(
      `Authorized ${this.name} new access token: ${Log.syntaxColor(response)}`
    );
    return response;
  }

  public async handleAuthorizationCodeRedirect(
    request: Request,
    session: OAuth2CLI.Localhost.Server
  ): Promise<OAuth2CLI.Token.Response> {
    Log.debug(
      `Handling ${this.name} authorization code redirect: ${Log.syntaxColor(request)}`
    );
    const response = await super.handleAuthorizationCodeRedirect(
      request,
      session
    );
    Log.debug(
      `Received ${this.name} authorization code response: ${Log.syntaxColor(response)}`
    );
    return response;
  }

  protected async refreshTokenGrant({
    refresh_token,
    inject
  }: Parameters<OAuth2CLI.Client['refreshTokenGrant']>[0] = {}) {
    Log.debug(
      `Attempting to refresh ${this.name} access token: ${Log.syntaxColor({ refresh_token, inject })}`
    );
    const refreshed = await super.refreshTokenGrant({ refresh_token, inject });
    if (refreshed) {
      Log.debug(
        `Received refreshed ${this.name} access token: ${Log.syntaxColor(refreshed)}`
      );
    } else {
      Log.debug(`${this.name} token refresh failed`);
    }
    return refreshed;
  }

  protected async prepareRequest(
    config: OpenIDClient.Configuration,
    accessToken: string,
    url: URL,
    method: string,
    body?: OpenIDClient.FetchBody,
    headers?: Headers | undefined,
    options?: OpenIDClient.DPoPOptions | undefined
  ): Promise<OAuth2CLI.PreparedRequest> {
    Log.debug(
      `Sending request to ${this.name}: ${Log.syntaxColor({ method, url, headers: Object.fromEntries(headers?.entries() || []), body: `${body}` })}`
    );
    return [config, accessToken, url, method, body, headers, options];
  }

  protected async prepareResponse(response: Response): Promise<Response> {
    Log.debug(
      `Received response from ${this.name}: ${Log.syntaxColor({
        ok: response.ok,
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        body: response.body ? '<not yet parsed>' : null
      })}`
    );
    return response;
  }

  public async requestJSON<J extends JSONValue = JSONValue>(
    url: URL.ish,
    method = 'GET',
    body?: Body.ish,
    headers: Headers.ish = {},
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
      `JSON body from ${this.name}: ${
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
