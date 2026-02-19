import { PathString } from '@battis/descriptive-types';
import { JSONValue } from '@battis/typescript-tricks';
import { Mutex } from 'async-mutex';
import { Request } from 'express';
import * as gcrtl from 'gcrtl';
import { EventEmitter } from 'node:events';
import path from 'node:path';
import * as OpenIDClient from 'openid-client';
import * as requestish from 'requestish';
import { Credentials } from './Credentials.js';
import { Injection } from './Injection.js';
import * as Scope from './Scope.js';
import * as Token from './Token/index.js';
import { WebServer } from './WebServer.js';

/**
 * A generic `redirect_uri` to use if the server does not require pre-registered
 * `redirect_uri` values
 */
export const DEFAULT_REDIRECT_URI = 'http://localhost:3000/oauth2-cli/redirect';

export type ClientOptions<C extends Credentials = Credentials> = {
  /** Human-readable name for client in messages */
  name?: string;

  /** Credentials for server access */
  credentials: C;

  /** Optional request components to inject */
  inject?: {
    search?: requestish.URLSearchParams.ish;
    headers?: requestish.Headers.ish;
    body?: requestish.Body.ish;
  };

  /** Base URL for all non-absolute requests */
  base_url?: requestish.URL.ish;

  /**
   * Optional absolute path to EJS view templates directory, see
   * [WebServer.setViews()](./Webserver.ts)
   */
  views?: PathString;
  /** Optional {@link TokenStorage} implementation to manage tokens */
  storage?: Token.Storage;
};

type RefreshOptions = {
  /**
   * Optional refresh token
   *
   * If using {@link TokenStorage}, the refresh token should be stored with the
   * access token and does not need to be separately managed and stored
   */
  refresh_token?: string;
  /** Additional request injection for refresh grant flow */
  inject?: Injection;
};

type GetTokenOptions = {
  /**
   * Optional access token
   *
   * If using {@link TokenStorage}, the access token does not need to be
   * separately managed and stored
   */
  token?: Token.Response;
  /**
   * Additional request injection for authorization code grant and/or refresh
   * grant flows
   */
  inject?: Injection;
};

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

  protected credentials: C;

  protected base_url?: requestish.URL.ish;

  protected config?: OpenIDClient.Configuration;

  protected inject?: Injection;

  protected views?: PathString;

  private token?: Token.Response;
  private tokenLock = new Mutex();

  private storage?: Token.Storage;

  public constructor({
    name,
    credentials,
    base_url,
    views,
    inject,
    storage
  }: ClientOptions<C>) {
    super();
    this._name = name;
    this.credentials = credentials;
    this.base_url = base_url;
    this.views = views;
    this.inject = inject;
    this.storage = storage;
  }

  public get name() {
    if (this._name && this._name.length > 0) {
      return this._name;
    }
    return 'oauth2-cli';
  }

  public get redirect_uri() {
    return this.credentials.redirect_uri;
  }

  /**
   * @throws IndeterminateConfiguration if provided credentials combined with
   *   OpenID discovery fail to generate a complete configuration
   */
  public async getConfiguration() {
    let error = undefined;
    if (!this.config && this.credentials.issuer) {
      try {
        this.config = await OpenIDClient.discovery(
          requestish.URL.from(this.credentials.issuer),
          this.credentials.client_id,
          { client_secret: this.credentials.client_secret }
        );
      } catch (e) {
        error = e;
      }
    }
    if (!this.config && this.credentials?.authorization_endpoint) {
      this.config = new OpenIDClient.Configuration(
        {
          issuer: `https://${requestish.URL.from(this.credentials.authorization_endpoint).hostname}`,
          authorization_endpoint: requestish.URL.toString(
            this.credentials.authorization_endpoint
          ),
          token_endpoint: requestish.URL.toString(
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
        `The ${this.name} configuration could not be constructed from provided credentials.`,
        {
          cause: {
            credentials: this.credentials,
            'OpenID configuration result': error
          }
        }
      );
    }
    return this.config;
  }

  protected async getParameters(server: WebServer) {
    const params = requestish.URLSearchParams.from(
      this.inject?.search || new URLSearchParams()
    );
    params.set(
      'redirect_uri',
      requestish.URL.toString(this.credentials.redirect_uri)
    );
    params.set(
      'code_challenge',
      await OpenIDClient.calculatePKCECodeChallenge(server.code_verifier)
    );
    params.set('code_challenge_method', 'S256');
    params.set('state', server.state);
    if (this.credentials.scope) {
      params.set('scope', Scope.toString(this.credentials.scope));
    }
    return params;
  }

  public async getAuthorizationUrl(server: WebServer) {
    return OpenIDClient.buildAuthorizationUrl(
      await this.getConfiguration(),
      await this.getParameters(server)
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

  public async authorize({ inject: _ }: { inject?: Injection } = {}) {
    const server = new WebServer({
      client: this,
      redirect_uri: this.credentials.redirect_uri,
      views: this.views
    });
    const token = await this.save(await server.authorizationCodeGrant());
    return token;
  }

  public async handleAuthorizationCodeRedirect(
    req: Request,
    server: WebServer
  ) {
    try {
      /**
       * Do _NOT_ await this promise: the WebServer needs to send the
       * authorization complete response asynchronously before this can resolve,
       * and awaiting session.resolve() will block that response.
       */
      return await OpenIDClient.authorizationCodeGrant(
        await this.getConfiguration(),
        gcrtl.expand(req.url, this.redirect_uri),
        {
          pkceCodeVerifier: server.code_verifier,
          expectedState: server.state
        },
        this.inject?.search
          ? requestish.URLSearchParams.from(this.inject.search)
          : undefined
      );
    } catch (cause) {
      throw new Error(
        `Error making ${this.name} Authorization Code Grant request`,
        { cause }
      );
    }
  }

  protected async refreshTokenGrant({
    refresh_token = this.token?.refresh_token,
    inject: request
  }: RefreshOptions = {}) {
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
        ? requestish.URLSearchParams.from(this.inject.search)
        : undefined,
      {
        // @ts-expect-error 2322 undocumented arg pass-through to oauth4webapi
        headers: requestish.Headers.merge(this.headers, request?.headers)
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
  public async getToken({ token, inject: request }: GetTokenOptions = {}) {
    return await this.tokenLock.runExclusive(async () => {
      token = token || this.token;
      if (!this.token?.expiresIn() && this.storage) {
        this.token = await this.refreshTokenGrant({ inject: request });
      }
      if (!this.token) {
        this.token = await this.authorize({ inject: request });
      }
      return this.token;
    });
  }

  /** @throws MissingAccessToken If response does not include `access_token` */
  protected async save(token: Token.Response) {
    this.token = token;
    if (!token.access_token) {
      throw new Error(`No access_token in response to ${this.name}.`, {
        cause: token
      });
    }
    if (this.storage && this.token.refresh_token) {
      await this.storage.save(this.token.refresh_token);
    }
    this.emit(Client.TokenEvent, this.token);
    return this.token;
  }

  /**
   * @param url If an `issuer` has been defined, `url` accepts paths relative to
   *   the `issuer` URL as well as absolute URLs
   * @param method Optional, defaults to `GET` unless otherwise specified
   * @param body Optional
   * @param headers Optional
   * @param dPoPOptions Optional
   */
  public async request(
    url: requestish.URL.ish,
    method = 'GET',
    body?: OpenIDClient.FetchBody,
    headers: requestish.Headers.ish = {},
    dPoPOptions?: OpenIDClient.DPoPOptions
  ) {
    try {
      url = requestish.URL.from(url);
    } catch (error) {
      if (this.base_url || this.credentials.issuer) {
        url = path.join(
          // @ts-expect-error 2345 TS, I _just_ tested this!
          requestish.URL.toString(this.base_url || this.credentials.issuer),
          requestish.URL.toString(url).replace(/^\/?/, '')
        );
      } else {
        throw new Error(`Invalid request URL "${url}" to ${this.name}`, {
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
        requestish.URL.from(
          requestish.URLSearchParams.appendTo(url, this.inject?.search || {})
        ),
        method,
        body,
        requestish.Headers.merge(this.inject?.headers, headers),
        dPoPOptions
      );
    try {
      return await request();
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'status' in error &&
        error.status === 401
      ) {
        await this.authorize();
        return await request();
      } else {
        throw error;
      }
    }
  }

  private async toJSON<J extends JSONValue>(response: Response) {
    if (response.ok) {
      return (await response.json()) as J;
    } else {
      throw new Error(
        `The response could not be parsed as JSON by ${this.name}.`,
        { cause: { response } }
      );
    }
  }

  /**
   * Returns the result of {@link request} as a parsed JSON object, optionally
   * typed as `J`
   */
  public async requestJSON<J extends JSONValue = JSONValue>(
    url: requestish.URL.ish,
    method = 'GET',
    body?: OpenIDClient.FetchBody,
    headers: requestish.Headers.ish = {},
    dPoPOptions?: OpenIDClient.DPoPOptions
  ) {
    return await this.toJSON<J>(
      await this.request(url, method, body, headers, dPoPOptions)
    );
  }

  public async fetch(
    input: requestish.URL.ish,
    init?: RequestInit,
    dPoPOptions?: OpenIDClient.DPoPOptions
  ) {
    return await this.request(
      input,
      init?.method,
      await requestish.Body.from(init?.body),
      requestish.Headers.from(init?.headers),
      dPoPOptions
    );
  }

  public async fetchJSON<J extends JSONValue = JSONValue>(
    input: requestish.URL.ish,
    init?: RequestInit,
    dPoPOptions?: OpenIDClient.DPoPOptions
  ) {
    return await this.toJSON<J>(await this.fetch(input, init, dPoPOptions));
  }
}
