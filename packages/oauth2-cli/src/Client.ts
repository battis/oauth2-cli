import { JSONValue } from '@battis/typescript-tricks';
import { Mutex } from 'async-mutex';
import { Request } from 'express';
import * as gcrtl from 'gcrtl';
import { EventEmitter } from 'node:events';
import { text } from 'node:stream/consumers';
import * as OpenIDClient from 'openid-client';
import * as requestish from 'requestish';
import { Credentials } from './Credentials.js';
import { Injection } from './Injection.js';
import * as Localhost from './Localhost/index.js';
import * as Options from './Options.js';
import { PaginatedCollection } from './PaginatedCollection.js';
import * as Token from './Token/index.js';

export type PreparedRequest = Parameters<
  (typeof OpenIDClient)['fetchProtectedResource']
>;

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
    return 'API';
  }

  /** Human-readable reason for authorization in messages */
  private reason?: string;

  /** Credentials for server access */
  public credentials: C;

  /** Base URL for all non-absolute requests */
  public base_url?: requestish.URL.ish;

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

  /** @see {@link Options.Client} */
  public constructor({
    name,
    reason,
    credentials,
    base_url,
    inject,
    storage,
    localhost
  }: Options.Client<C>) {
    super();
    this._name = name;
    this.reason = reason;
    this.credentials = credentials;
    this.base_url = base_url;
    this.localhostOptions = localhost;
    this.inject = inject;
    this.storage = storage;
  }

  /**
   * Build a client configuration either via `issuer` discovery or from provided
   * `credentials`
   */
  public async getConfiguration() {
    let discovery = undefined;
    if (!this.config && this.credentials.issuer) {
      try {
        this.config = await OpenIDClient.discovery(
          requestish.URL.from(this.credentials.issuer),
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

  /**
   * Build a URL to redirect the user-agent to, in order to request
   * authorization at the Authorization Server
   *
   * @param session Contains the current `state` and `code_verifier` for the
   *   Authorization Code flow session
   */
  public async buildAuthorizationUrl(session: Localhost.Server) {
    const params = requestish.URLSearchParams.from(this.inject?.search);
    params.set(
      'redirect_uri',
      requestish.URL.toString(this.credentials.redirect_uri)
    );
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

  /** Does the client hold or have access to an unexpired API access token? */
  public async isAuthorized(): Promise<boolean> {
    if (this.token?.expiresIn()) {
      return true;
    } else {
      return await this.tokenLock.runExclusive(async () => {
        try {
          return !!(await this.refreshTokenGrant());
        } catch (_) {
          return false;
        }
      });
    }
  }

  /** Start interactive authorization for API access with the user */
  public async authorize() {
    return await this.tokenLock.runExclusive(async () => {
      return await this._authorize();
    });
  }

  /**
   * Start interactive authorization for API access with the user _without_
   * checking for tokenLock mutex
   *
   * Should be called _only_ from within a `tokenLock.runExclusive()` callback
   */
  private async _authorize() {
    const session = new Localhost.Server({
      client: this,
      reason: this.reason,
      ...this.localhostOptions
    });
    const token = await this.save(await session.authorizationCodeGrant());
    return token;
  }

  /**
   * Validate the authorization response and then executes the !"Authorization
   * Code Grant" at the Authorization Server's token endpoint to obtain an
   * access token. ID Token and Refresh Token are also optionally issued by the
   * server.
   *
   * @param request Authorization Server's request to the Localhost redirect
   *   server
   * @param session Contains the current `state` and `code_verifier` for the
   *   Authorization Code flow session
   */
  public async handleAuthorizationCodeRedirect(
    request: Request,
    session: Localhost.Server
  ) {
    try {
      return await OpenIDClient.authorizationCodeGrant(
        await this.getConfiguration(),
        gcrtl.expand(request.url, this.credentials.redirect_uri),
        {
          pkceCodeVerifier: session.code_verifier,
          expectedState: session.state
        },
        this.inject?.search
          ? requestish.URLSearchParams.from(this.inject.search)
          : undefined
      );
    } catch (cause) {
      throw new Error(`${this.name} authorization code grant failed.`, {
        cause
      });
    }
  }

  /**
   * Perform an OAuth 2.0 Refresh Token Grant at the Authorization Server's
   * token endpoint, allowing the client to obtain a new access token using a
   * valid `refresh_token`.
   *
   * @see {@link Options.Refresh}
   */
  protected async refreshTokenGrant({
    refresh_token = this.token?.refresh_token,
    inject
  }: Options.Refresh = {}) {
    if (!refresh_token && !this.token && this.storage) {
      refresh_token = await this.storage.load();
    }
    if (!refresh_token || refresh_token === '') {
      return undefined;
    }
    try {
      const token = await OpenIDClient.refreshTokenGrant(
        await this.getConfiguration(),
        refresh_token,
        this.inject?.search
          ? requestish.URLSearchParams.from(this.inject.search)
          : undefined,
        {
          // @ts-expect-error 2322 undocumented arg pass-through to oauth4webapi
          headers: requestish.Headers.merge(this.headers, inject?.headers)
        }
      );
      return await this.save(token);
    } catch (cause) {
      throw new Error(`Could not refresh access to ${this.name}`, { cause });
    }
  }

  /**
   * Get an unexpired access token
   *
   * Depending on provided and/or stored access token and refresh token values,
   * this may require interactive authorization
   *
   * @see {@link Options.GetToken}
   */
  public async getToken({ token, inject: request }: Options.GetToken = {}) {
    return await this.tokenLock.runExclusive(async () => {
      token = token || this.token;
      if (!this.token?.expiresIn() && this.storage) {
        try {
          this.token = await this.refreshTokenGrant({ inject: request });
        } catch (_) {
          // token definitely expired and refrehing it failed
          this.token = undefined;
        }
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
   * @param url If an `base_url` or `issuer` has been defined, `url` accepts
   *   paths relative to the `issuer` URL as well as absolute URLs
   * @param method Optional, defaults to `GET` unless otherwise specified
   * @param body Optional
   * @param dPoPOptions Optional, see {@link OpenIDClient.DPoPOptions}
   */
  public async requestRaw(
    url: requestish.URL.ish,
    method = 'GET',
    body?: requestish.Body.ish,
    headers: requestish.Headers.ish = {},
    dPoPOptions?: OpenIDClient.DPoPOptions
  ) {
    url = new URL(url, this.base_url || this.credentials.issuer);
    url = requestish.URL.from(
      requestish.URLSearchParams.appendTo(
        url,
        requestish.URLSearchParams.merge(this.inject?.search, url.searchParams)
      )
    );
    const request = async () =>
      await OpenIDClient.fetchProtectedResource(
        ...(await this.prepareRequest(
          await this.getConfiguration(),
          (await this.getToken()).access_token,
          url,
          method,
          await requestish.Body.from(body),
          requestish.Headers.merge(this.inject?.headers, headers),
          dPoPOptions
        ))
      );
    try {
      return this.prepareResponse(await request());
    } catch (cause) {
      if (Error.isError(cause) && 'status' in cause && cause.status === 401) {
        await this.authorize();
        return this.prepareResponse(await request());
      } else {
        throw new Error(`${this.name} request failed`, { cause });
      }
    }
  }

  /**
   * Available hook to manipulate a fully-prepared request before sending to the
   * server
   */
  protected async prepareRequest(
    ...args: PreparedRequest
  ): Promise<PreparedRequest> {
    return args;
  }

  /**
   * Available hook to manipulate the complete response from the server before
   * processing it
   */
  protected async prepareResponse(response: Response): Promise<Response> {
    return response;
  }

  /**
   * Available hook to check for a paginated response and return an interable
   * PaginatedCollection
   */
  protected checkForPagination<T extends JSONValue = JSONValue>(
    _response: Response,
    _data: JSONValue
  ): PaginatedCollection<T> | undefined {
    return undefined;
  }

  /**
   * Process a raw response int JSON, typing it as `T` or as a
   * `PaginatedCollection<T>`
   *
   * @param response Raw response
   */
  public async processResponse<T extends JSONValue = JSONValue>(
    response: Response,
    paginationCheck: false
  ): Promise<T>;
  public async processResponse<T extends JSONValue = JSONValue>(
    response: Response,
    paginationCheck?: true
  ): Promise<T | PaginatedCollection<T>>;
  public async processResponse<T extends JSONValue>(
    response: Response,
    paginationCheck = true
  ) {
    if (response.ok) {
      const body = await response.text();
      try {
        const data = JSON.parse(body) as JSONValue;
        let paginatedCollection: PaginatedCollection<T> | undefined;
        if (
          paginationCheck &&
          (paginatedCollection = this.checkForPagination<T>(response, data))
        ) {
          return paginatedCollection;
        }
        return data as T;
      } catch (error) {
        throw new Error(`${this.name} response could not be parsed as JSON`, {
          cause: { error, body }
        });
      }
    } else {
      throw new Error(`${this.name} response status not ok`, {
        cause: {
          response: {
            ok: response.ok,
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            body: response.body ? `${await text(response.body)}` : undefined
          }
        }
      });
    }
  }

  /**
   * Returns the result of {@link requestRaw} as a parsed JSON object, optionally
   * typed as `T`
   *
   * @param pagination Optional function to test conversion of response into a
   *   `PaginatedCollection<T>`
   */
  public async request<T extends JSONValue = JSONValue>(
    url: requestish.URL.ish,
    method = 'GET',
    body?: requestish.Body.ish,
    headers: requestish.Headers.ish = {},
    dPoPOptions?: OpenIDClient.DPoPOptions
  ) {
    const response = await this.requestRaw(
      url,
      method,
      body,
      headers,
      dPoPOptions
    );
    return await this.processResponse<T>(response);
  }

  /**
   * Request a protected resource using the client's access token.
   *
   * This ensures that the access token is unexpired, and interactively requests
   * user authorization if it has not yet been provided.
   *
   * @param input If a `base_url` or `issuer` has been defined, `url` accepts
   *   paths relative to the `issuer` URL as well as absolute URLs
   * @param init Optional
   * @param dPoPOptions Optional, see {@link OpenIDClient.DPoPOptions}
   * @see {@link requestRaw} for which this is an alias for {@link https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API Fetch API}-style requests
   */
  public async fetchRaw(
    input: requestish.URL.ish,
    init?: RequestInit,
    dPoPOptions?: OpenIDClient.DPoPOptions
  ) {
    return await this.requestRaw(
      input,
      init?.method,
      await requestish.Body.from(init?.body),
      requestish.Headers.from(init?.headers),
      dPoPOptions
    );
  }

  /**
   * Returns the result of {@link fetch} as a parsed JSON object, optionally
   * typed as `T`
   */
  public async fetch<T extends JSONValue = JSONValue>(
    input: requestish.URL.ish,
    init?: RequestInit,
    dPoPOptions?: OpenIDClient.DPoPOptions
  ) {
    return await this.request<T>(
      input,
      init?.method,
      await requestish.Body.from(init?.body),
      requestish.Headers.from(init?.headers),
      dPoPOptions
    );
  }
}
