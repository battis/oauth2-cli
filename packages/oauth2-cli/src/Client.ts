import { PathString } from '@battis/descriptive-types';
import { Mutex } from 'async-mutex';
import { Request } from 'express';
import { EventEmitter } from 'node:events';
import * as OpenIDClient from 'openid-client';
import * as Credentials from './Credentials.js';
import * as Errors from './Errors/index.js';
import * as Req from './Request/index.js';
import { Session, SessionOptions } from './Session.js';
import * as Token from './Token/index.js';

/**
 * A generic `redirect_uri` to use if the server does not require pre-registered
 * `redirect_uri` values
 */
export const DEFAULT_REDIRECT_URI = 'http://localhost:3000/oauth2-cli/redirect';

export type ClientOptions = {
  /** Credentials for server access */
  credentials: Credentials.Combined;
  /**
   * Optional absolute path to EJS view templates directory, see
   * [WebServer.setViews()](./Webserver.ts)
   */
  views?: PathString;
  /** Optional {@link TokenStorage} implementation to manage tokens */
  storage?: Token.TokenStorage;
  /**
   * Optional search query parameters to include in all server requests (see
   * {@link RequestAddons.search})
   */
  search?: Req.URLSearchParams.ish;
  /**
   * Optional headers to include in all server requests (see
   * {@link RequestAddons.headers})
   */
  headers?: Req.Headers.ish;
  /**
   * Optional body parameters to include in applicable server requests (see
   * {@link RequestAddons.body})
   */
  body?: Req.Body.ish;
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
  inject?: Req.Injection;
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
  inject?: Req.Injection;
};

/**
 * Wrap {@link https://www.npmjs.com/package/openid-client openid-client} in a
 * class instance specific to a particular OAuth/OpenID server credential-set,
 * abstracting away most flows into {@link getToken}
 *
 * Emits {@link Client.TokenEvent} whenever a new access token is received
 */
export class Client extends EventEmitter {
  public static readonly TokenEvent = 'token';

  private credentials: Credentials.Combined;
  private config?: OpenIDClient.Configuration;

  private views?: PathString;

  private token?: Token.Response;
  private tokenLock = new Mutex();

  private search?: Req.URLSearchParams.ish;
  private headers?: Req.Headers.ish;
  private body?: Req.Body.ish;

  private storage?: Token.TokenStorage;

  public constructor({
    credentials,
    views,
    search,
    headers,
    body,
    storage
  }: ClientOptions) {
    super();
    this.credentials = credentials;
    this.views = views;
    this.search = search;
    this.headers = headers;
    this.body = body;
    this.storage = storage;
  }

  public get redirect_uri() {
    return this.credentials.redirect_uri;
  }

  /**
   * @throws IndeterminateConfiguration if provided credentials combined with
   *   OpenID discovery fail to generate a complete configuration
   */
  public async getConfiguration() {
    if (!this.config && this.credentials.issuer) {
      this.config = await OpenIDClient.discovery(
        Req.URL.from(this.credentials.issuer),
        this.credentials.client_id,
        { client_secret: this.credentials.client_secret }
      );
    }
    if (!this.config && this.credentials?.authorization_endpoint) {
      this.config = new OpenIDClient.Configuration(
        {
          issuer: `https://${Req.URL.from(this.credentials.authorization_endpoint).hostname}`,
          authorization_endpoint: Req.URL.toString(
            this.credentials.authorization_endpoint
          ),
          token_endpoint: Req.URL.toString(
            this.credentials.token_endpoint ||
              this.credentials.authorization_endpoint
          )
        },
        this.credentials.client_id,
        { client_secret: this.credentials.client_secret }
      );
    }
    if (!this.config) {
      throw new Errors.IndeterminateConfiguration();
    }
    return this.config;
  }

  protected async getParameters(session: Session) {
    const params =
      Req.URLSearchParams.merge(this.search, session.inject?.search) ||
      new URLSearchParams();
    params.set('redirect_uri', Req.URL.toString(this.credentials.redirect_uri));
    params.set(
      'code_challenge',
      await OpenIDClient.calculatePKCECodeChallenge(session.code_verifier)
    );
    params.set('code_challenge_method', 'S256');
    params.set('state', session.state);
    return params;
  }

  public async getAuthorizationUrl(session: Session) {
    return OpenIDClient.buildAuthorizationUrl(
      await this.getConfiguration(),
      await this.getParameters(session)
    );
  }

  public createSession({
    views,
    ...options
  }: Omit<SessionOptions, 'client'>): Session {
    return new Session({
      client: this,
      views: views || this.views,
      ...options
    });
  }

  public async authorize(options: Omit<SessionOptions, 'client'> = {}) {
    const session = this.createSession(options);
    const token = await this.save(await session.authorizationCodeGrant());
    return token;
  }

  public async handleAuthorizationCodeRedirect(req: Request, session: Session) {
    try {
      const response = await OpenIDClient.authorizationCodeGrant(
        await this.getConfiguration(),
        new URL(req.url, this.redirect_uri),
        {
          pkceCodeVerifier: session.code_verifier,
          expectedState: session.state
        },
        this.search ? Req.URLSearchParams.from(this.search) : undefined
      );
      await session.resolve(response);
    } catch (error) {
      await session.resolve(undefined, error as Error);
    }
  }

  /**
   * @throws MissingRefreshToken if `refresh_token` not passed or found in
   *   current token
   */
  protected async refreshTokenGrant({
    refresh_token,
    inject: request
  }: RefreshOptions) {
    if (!this.token && this.storage) {
      this.token = await this.storage.load();
    }
    refresh_token = refresh_token || this.token?.refresh_token;
    if (!refresh_token) {
      throw new Errors.MissingRefreshToken();
    }
    const response = await OpenIDClient.refreshTokenGrant(
      await this.getConfiguration(),
      refresh_token,
      this.search ? Req.URLSearchParams.from(this.search) : undefined,
      {
        // @ts-expect-error 2322 undocumented arg pass-through to oauth4webapi
        headers: Utilities.Request.mergeHeaders(this.headers, request?.headers)
      }
    );
    return this.save(response);
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
      if (!token && this.storage) {
        this.token = await this.storage.load();
      }
      const expiresIn = this.token?.expiresIn();
      if (!expiresIn) {
        try {
          this.token = await this.refreshTokenGrant({ inject: request });
        } catch (_) {
          this.token = undefined;
        }
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
      throw new Errors.MissingAccessToken();
    }
    if (this.storage) {
      await this.storage.save(this.token);
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
    url: Req.URL.ish,
    method = 'GET',
    body?: OpenIDClient.FetchBody,
    headers: Req.Headers.ish = {},
    dPoPOptions?: OpenIDClient.DPoPOptions
  ) {
    try {
      url = Req.URL.from(url);
    } catch (error) {
      if (this.credentials.issuer) {
        url = new URL(url, this.credentials.issuer);
      } else {
        throw error;
      }
    }
    const request = async () =>
      await OpenIDClient.fetchProtectedResource(
        await this.getConfiguration(),
        (await this.getToken()).access_token,
        Req.URL.from(Req.URLSearchParams.appendTo(url, this.search || {})),
        method,
        body,
        Req.Headers.merge(this.headers, headers),
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

  private async toJSON<T extends OpenIDClient.JsonValue>(response: Response) {
    if (response.ok) {
      return (await response.json()) as T;
    } else {
      throw new Errors.BadResponse(response);
    }
  }

  /**
   * Returns the result of {@link request} as a parsed JSON object, optionally
   * typed as `T`
   */
  public async requestJSON<
    T extends OpenIDClient.JsonValue = OpenIDClient.JsonValue
  >(
    url: Req.URL.ish,
    method = 'GET',
    body?: OpenIDClient.FetchBody,
    headers: Req.Headers.ish = {},
    dPoPOptions?: OpenIDClient.DPoPOptions
  ) {
    return await this.toJSON<T>(
      await this.request(url, method, body, headers, dPoPOptions)
    );
  }

  public async fetch(
    input: Req.URL.ish,
    init?: RequestInit,
    dPoPOptions?: OpenIDClient.DPoPOptions
  ) {
    return await this.request(
      input,
      init?.method,
      await Req.Body.from(init?.body),
      Req.Headers.from(init?.headers),
      dPoPOptions
    );
  }

  public async fetchJSON<
    T extends OpenIDClient.JsonValue = OpenIDClient.JsonValue
  >(
    input: Req.URL.ish,
    init?: RequestInit,
    dPoPOptions?: OpenIDClient.DPoPOptions
  ) {
    return await this.toJSON<T>(await this.fetch(input, init, dPoPOptions));
  }
}
