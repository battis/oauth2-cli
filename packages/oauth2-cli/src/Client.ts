import { PathString } from '@battis/descriptive-types';
import { Request } from 'express';
import { EventEmitter } from 'node:events';
import * as OpenIDClient from 'openid-client';
import * as Credentials from './Credentials/index.js';
import { BadResponse } from './Errors/BadResponse.js';
import {
  IndeterminateConfiguration,
  MissingAccessToken,
  MissingRefreshToken
} from './Errors/index.js';
import * as Req from './Request/index.js';
import { Session } from './Session.js';
import * as Token from './Token/index.js';

/**
 * A generic `redirect_uri` to use if the server does not require pre-registered
 * `redirect_uri` values
 */
export const DEFAULT_REDIRECT_URI = 'http://localhost:3000/oauth2-cli/redirect';

type ConstructorOptions = {
  /** Credentials for server access */
  credentials: Credentials.Combined;
  /**
   * Optional absolute path to EJS view templates directory, see
   * {@link WebServer.setViews}
   */
  views?: PathString;
  /** Optional {@link TokenStorage} implementation to manage tokens */
  storage?: Token.TokenStorage;
  /**
   * Optional search query parameters to include in all server requests (see
   * {@link RequestAddons.search})
   */
  search?: Req.Query.ish;
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

type AuthorizationOptions = {
  /** {@link Localhost.setViews see Localhost.setViews()} */
  views?: PathString;
  /** Additional request configuration for authorization code grant flow */
  request?: Req.AddOns;
};

type RefreshOptions = {
  /**
   * Optional refresh token
   *
   * If using {@link TokenStorage}, the refresh token should be stored with the
   * access token and does not need to be separately managed and stored
   */
  refresh_token?: string;
  /** Additional request configuration for refresh grant flow */
  request?: Req.AddOns;
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
   * Additional request confguration for authorization code grant and/or refresh
   * grant flows
   */
  request?: Req.AddOns;
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

  private search?: Req.Query.ish;
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
  }: ConstructorOptions) {
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
    if (!this.config && this.credentials?.issuer) {
      this.config = await OpenIDClient.discovery(
        Req.URL.toURL(this.credentials.issuer),
        this.credentials.client_id,
        { client_secret: this.credentials.client_secret }
      );
    }
    if (!this.config && this.credentials?.authorization_endpoint) {
      this.config = new OpenIDClient.Configuration(
        {
          issuer: `https://${Req.URL.toURL(this.credentials.authorization_endpoint).hostname}`,
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
      throw new IndeterminateConfiguration();
    }
    return this.config;
  }

  protected async getParameters(session: Session) {
    const params =
      Req.Query.mergeSearch(this.search, session.request?.search) ||
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

  public async authorize({ views, request }: AuthorizationOptions = {}) {
    const session = new Session({
      client: this,
      request,
      views: views || this.views
    });
    const token = await this.save(await session.requestAuthorizationCode());
    return token;
  }

  public async handleRedirect(req: Request, session: Session) {
    try {
      const response = await OpenIDClient.authorizationCodeGrant(
        await this.getConfiguration(),
        new URL(req.url, this.redirect_uri),
        {
          pkceCodeVerifier: session.code_verifier,
          expectedState: session.state
        },
        this.search ? Req.Query.toURLSearchParams(this.search) : undefined
      );
      await session.callback(response);
    } catch (error) {
      await session.callback(undefined, error as Error);
    }
  }

  /**
   * @throws MissingRefreshToken if `refresh_token` not passed or found in
   *   current token
   */
  protected async refreshTokenGrant({
    refresh_token,
    request
  }: RefreshOptions) {
    if (!this.token && this.storage) {
      this.token = await this.storage.load();
    }
    refresh_token = refresh_token || this.token?.refresh_token;
    if (!refresh_token) {
      throw new MissingRefreshToken();
    }
    const response = await OpenIDClient.refreshTokenGrant(
      await this.getConfiguration(),
      refresh_token,
      this.search ? Req.Query.toURLSearchParams(this.search) : undefined,
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
  public async getToken({ token, request }: GetTokenOptions = {}) {
    token = token || this.token;
    if (!token && this.storage) {
      this.token = await this.storage.load();
    }
    const expiresIn = this.token?.expiresIn();
    if (!expiresIn) {
      try {
        this.token = await this.refreshTokenGrant({ request });
      } catch (_) {
        // ignore error
      }
    }
    if (!this.token) {
      this.token = await this.authorize({ request });
    }
    return this.token;
  }

  /** @throws MissingAccessToken if response does not include `token` */
  protected async save(token: Token.Response) {
    this.token = token;
    if (!this.token) {
      throw new MissingAccessToken();
    }
    if (this.storage) {
      await this.storage.save(this.token);
    }
    this.emit(Client.TokenEvent, this.token);
    return this.token;
  }

  public async request(
    url: Req.URL.ish,
    method = 'GET',
    body?: OpenIDClient.FetchBody,
    headers: Req.Headers.ish = {},
    dPoPOptions?: OpenIDClient.DPoPOptions
  ) {
    return await OpenIDClient.fetchProtectedResource(
      await this.getConfiguration(),
      (await this.getToken()).access_token,
      Req.URL.toURL(Req.Query.appendTo(url, this.search || {})),
      method,
      body,
      Req.Headers.mergeHeaders(this.headers, headers),
      dPoPOptions
    );
  }

  public async requestJSON<
    T extends OpenIDClient.JsonValue = OpenIDClient.JsonValue
  >(
    url: Req.URL.ish,
    method = 'GET',
    body?: OpenIDClient.FetchBody,
    headers: Req.Headers.ish = {},
    dPoPOptions?: OpenIDClient.DPoPOptions
  ) {
    const response = await this.request(
      url,
      method,
      body,
      headers,
      dPoPOptions
    );
    if (response.ok) {
      return (await response.json()) as T;
    } else {
      throw new BadResponse(response);
    }
  }
}
