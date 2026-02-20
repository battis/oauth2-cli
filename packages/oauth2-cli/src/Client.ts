import { JSONValue } from '@battis/typescript-tricks';
import { Mutex } from 'async-mutex';
import { Request } from 'express';
import * as gcrtl from 'gcrtl';
import { EventEmitter } from 'node:events';
import path from 'node:path';
import * as OpenIDClient from 'openid-client';
import { Body, Headers, URL, URLSearchParams } from 'requestish';
import { Credentials } from './Credentials.js';
import { Injection } from './Injection.js';
import * as Localhost from './Localhost/index.js';
import * as Options from './Options.js';
import * as Token from './Token/index.js';

/**
 * A generic `redirect_uri` to use if the server does not require pre-registered
 * `redirect_uri` values
 */
export const DEFAULT_REDIRECT_URI = 'http://localhost:3000/oauth2-cli/redirect';

/**
 * Wrap {@link https://www.npmjs.com/package/openid-client openid-client} in a
 * class instance specific to a particular OAuth/OpenID server credential-set,
 * abstracting away most flows into {@link getToken}
 *
 * Emits {@link Client.TokenEvent} whenever a new access token is received
 */
export class Client<C extends Credentials = Credentials> extends EventEmitter {
  public static readonly TokenEvent = 'token';

  private _name?: string;

  /** Human-readable name for client in messages */
  public get name() {
    if (this._name && this._name.length > 0) {
      return this._name;
    }
    return 'oauth2-cli';
  }

  /** Credentials for server access */
  public credentials: C;

  /** Base URL for all non-absolute requests */
  public base_url?: URL.ish;

  /**
   * `openid-client` configuration metadata (either dervied from
   * {@link credentials}) or requested from the well-known OpenID configuration
   * endpoint of the `issuer`
   */
  protected config?: OpenIDClient.Configuration;

  /** Optional request components to inject */
  protected inject?: Injection;

  /** Optional configuration options for web server listening for redirect */
  private localhostOptions?: Options.LocalhostOptions;

  /** Optional {@link TokenStorage} implementation to manage tokens */
  private storage?: Token.Storage;

  /** Current response to an access token grant request, if available */
  private token?: Token.Response;

  /** Mutex preventing multiple simultaneous access token grant requests */
  private tokenLock = new Mutex();

  public constructor({
    name,
    credentials,
    base_url,
    inject,
    storage,
    localhost
  }: Options.Client<C>) {
    super();
    this._name = name;
    this.credentials = credentials;
    this.base_url = base_url;
    this.localhostOptions = localhost;
    this.inject = inject;
    this.storage = storage;
  }

  /**
   * @throws IndeterminateConfiguration if provided credentials combined with
   *   OpenID discovery fail to generate a complete configuration
   */
  public async getConfiguration() {
    let discovery = undefined;
    if (!this.config && this.credentials.issuer) {
      try {
        this.config = await OpenIDClient.discovery(
          URL.from(this.credentials.issuer),
          this.credentials.client_id,
          { client_secret: this.credentials.client_secret }
        );
      } catch (error) {
        discovery = error;
      }
    }
    if (!this.config && this.credentials?.authorization_endpoint) {
      this.config = new OpenIDClient.Configuration(
        {
          issuer: `https://${URL.from(this.credentials.authorization_endpoint).hostname}`,
          authorization_endpoint: URL.toString(
            this.credentials.authorization_endpoint
          ),
          token_endpoint: URL.toString(
            this.credentials.token_endpoint ||
              this.credentials.authorization_endpoint
          )
        },
        this.credentials.client_id,
        { client_secret: this.credentials.client_secret }
      );
    }
    if (!this.config) {
      throw new Error(
        `Client configuration for ${this.name} could not be discovered or derived from credentials`,
        {
          cause: {
            credentials: this.credentials,
            discovery
          }
        }
      );
    }
    return this.config;
  }

  public async getAuthorizationUrl(session: Localhost.Server) {
    const params = URLSearchParams.from(this.inject?.search);
    params.set('redirect_uri', URL.toString(this.credentials.redirect_uri));
    params.set(
      'code_challenge',
      await OpenIDClient.calculatePKCECodeChallenge(session.code_verifier)
    );
    params.set('code_challenge_method', 'S256');
    params.set('state', session.state);
    if (this.credentials.scope) {
      params.set('scope', Token.Scope.toString(this.credentials.scope));
    }

    return OpenIDClient.buildAuthorizationUrl(
      await this.getConfiguration(),
      params
    );
  }

  public async isAuthorized(): Promise<boolean> {
    if (this.token?.expiresIn()) {
      return true;
    } else {
      return await this.tokenLock.runExclusive(async () => {
        return !!(await this.refreshTokenGrant());
      });
    }
  }

  public async authorize() {
    return await this.tokenLock.runExclusive(async () => {
      console.log('running authorize from external call');
      return await this._authorize();
    });
  }

  private async _authorize() {
    const session = new Localhost.Server({
      client: this,
      ...this.localhostOptions
    });
    const token = await this.save(await session.authorizationCodeGrant());
    return token;
  }

  public async handleAuthorizationCodeRedirect(
    req: Request,
    session: Localhost.Server
  ) {
    try {
      return await OpenIDClient.authorizationCodeGrant(
        await this.getConfiguration(),
        gcrtl.expand(req.url, this.credentials.redirect_uri),
        {
          pkceCodeVerifier: session.code_verifier,
          expectedState: session.state
        },
        this.inject?.search
          ? URLSearchParams.from(this.inject.search)
          : undefined
      );
    } catch (cause) {
      throw new Error(`${this.name} authorization code grant failed.`, {
        cause
      });
    }
  }

  protected async refreshTokenGrant({
    refresh_token = this.token?.refresh_token,
    inject: request
  }: Options.Refresh = {}) {
    if (!refresh_token && !this.token && this.storage) {
      refresh_token = await this.storage.load();
    }
    if (!refresh_token || refresh_token === '') {
      return undefined;
    }
    const token = await OpenIDClient.refreshTokenGrant(
      await this.getConfiguration(),
      refresh_token,
      this.inject?.search
        ? URLSearchParams.from(this.inject.search)
        : undefined,
      {
        // @ts-expect-error 2322 undocumented arg pass-through to oauth4webapi
        headers: Headers.merge(this.headers, request?.headers)
      }
    );
    return await this.save(token);
  }

  /**
   * Get an unexpired access token
   *
   * Depending on provided and/or stored access token and refresh token values,
   * this may require interactive authorization
   */
  public async getToken({ token, inject: request }: Options.GetToken = {}) {
    return await this.tokenLock.runExclusive(async () => {
      token = token || this.token;
      if (!this.token?.expiresIn() && this.storage) {
        this.token = await this.refreshTokenGrant({ inject: request });
      }
      if (!this.token) {
        this.token = await this._authorize();
      }
      return this.token;
    });
  }

  /**
   * Persist `refresh_token` if Token.Storage is configured and `refresh_token`
   * provided
   *
   * @throws If `response` does not include `access_token` property
   */
  protected async save(response: Token.Response) {
    this.token = response;
    if (!response.access_token) {
      throw new Error(
        `${this.name} token response does not contain access_token`,
        {
          cause: response
        }
      );
    }
    if (this.storage && this.token.refresh_token) {
      await this.storage.save(this.token.refresh_token);
    }
    this.emit(Client.TokenEvent, this.token);
    return this.token;
  }

  /**
   * Request a protected resource using the client's access token.
   *
   * This ensures that the access token is unexpired, and interactively requests
   * user authorization if it has not yet been provided.
   *
   * @param url If an `issuer` has been defined, `url` accepts paths relative to
   *   the `issuer` URL as well as absolute URLs
   * @param method Optional, defaults to `GET` unless otherwise specified
   * @param body Optional
   * @param headers Optional
   * @param dPoPOptions Optional
   */
  public async request(
    url: URL.ish,
    method = 'GET',
    body?: OpenIDClient.FetchBody,
    headers: Headers.ish = {},
    dPoPOptions?: OpenIDClient.DPoPOptions
  ) {
    try {
      url = URL.from(url);
    } catch (error) {
      if (this.base_url || this.credentials.issuer) {
        url = path.join(
          // @ts-expect-error 2345 TS, I _just_ tested this!
          URL.toString(this.base_url || this.credentials.issuer),
          URL.toString(url).replace(/^\/?/, '')
        );
      } else {
        throw new Error(`${this.name} request url invalid`, {
          cause: {
            base_url: this.base_url,
            issuer: this.credentials.issuer,
            error
          }
        });
      }
    }
    const request = async () =>
      await OpenIDClient.fetchProtectedResource(
        await this.getConfiguration(),
        (await this.getToken()).access_token,
        URL.from(URLSearchParams.appendTo(url, this.inject?.search || {})),
        method,
        body,
        Headers.merge(this.inject?.headers, headers),
        dPoPOptions
      );
    try {
      return await request();
    } catch (cause) {
      if (Error.isError(cause) && 'status' in cause && cause.status === 401) {
        await this.authorize();
        return await request();
      } else {
        throw new Error(`${this.name} request failed`, { cause });
      }
    }
  }

  private async toJSON<J extends JSONValue>(response: Response) {
    if (response.ok) {
      try {
        return (await response.json()) as J;
      } catch (cause) {
        throw new Error(`${this.name} response could not be parsed as JSON`, {
          cause
        });
      }
    } else {
      throw new Error(`${this.name} response status not ok`, {
        cause: { response }
      });
    }
  }

  /**
   * Returns the result of {@link request} as a parsed JSON object, optionally
   * typed as `J`
   */
  public async requestJSON<J extends JSONValue = JSONValue>(
    url: URL.ish,
    method = 'GET',
    body?: OpenIDClient.FetchBody,
    headers: Headers.ish = {},
    dPoPOptions?: OpenIDClient.DPoPOptions
  ) {
    return await this.toJSON<J>(
      await this.request(url, method, body, headers, dPoPOptions)
    );
  }

  public async fetch(
    input: URL.ish,
    init?: RequestInit,
    dPoPOptions?: OpenIDClient.DPoPOptions
  ) {
    return await this.request(
      input,
      init?.method,
      await Body.from(init?.body),
      Headers.from(init?.headers),
      dPoPOptions
    );
  }

  public async fetchJSON<J extends JSONValue = JSONValue>(
    input: URL.ish,
    init?: RequestInit,
    dPoPOptions?: OpenIDClient.DPoPOptions
  ) {
    return await this.toJSON<J>(await this.fetch(input, init, dPoPOptions));
  }
}
