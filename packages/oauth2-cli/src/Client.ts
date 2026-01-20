import * as Configuration from '@battis/oauth2-configure';
import { JSONValue } from '@battis/typescript-tricks';
import { Mutex } from 'async-mutex';
import * as OpenIDClient from 'openid-client';
import { FileStorage } from './FileStorage.js';
import * as Localhost from './Localhost.js';
import { Token } from './Token.js';
import { TokenStorage } from './TokenStorage.js';

export type Credentials = Configuration.Options & {
  scope?: string;
  headers?: Record<string, string>;
  parameters?: Record<string, string>;
  store?: TokenStorage | string;
};

/** Wrap an OpenID configuration in an object-oriented API client. */
export class Client {
  private tokenMutex = new Mutex();
  private config?: OpenIDClient.Configuration;
  private token?: Token;
  private store?: TokenStorage;

  public constructor(private credentials: Credentials) {
    if (this.credentials.store) {
      if (typeof this.credentials.store === 'string') {
        this.store = new FileStorage(this.credentials.store);
      } else {
        this.store = this.credentials.store;
      }
    }
  }

  /** Acquire a valid, unexpired API access token. */
  public async getToken(): Promise<Token | undefined> {
    return await this.tokenMutex.runExclusive(
      (async () => {
        if (!this.token) {
          this.token = await this.store?.load();
        }
        if (this.token?.hasExpired()) {
          this.token = await this.refreshToken(this.token);
        }
        if (!this.token) {
          this.token = await this.authorize();
        }
        return this.token;
      }).bind(this)
    );
  }

  /** Refresh Token Grant */
  protected async refreshToken(token: Token): Promise<Token | undefined> {
    if (token.refresh_token) {
      const { headers, parameters } = this.credentials;
      let freshTokens;
      if (
        (freshTokens = Token.fromResponse(
          await OpenIDClient.refreshTokenGrant(
            await Configuration.acquire(this.credentials),
            token.refresh_token,
            parameters,
            // @ts-expect-error 2322 undocumented arg pass-through to oauth4webapi
            { headers }
          ),
          token.refresh_token
        ))
      ) {
        if (this.store) {
          await this.store.save(freshTokens);
        }
        return freshTokens;
      }
    }
    return this.authorize();
  }

  /** Acquire a valid OpenID configuration. */
  protected async getConfiguration() {
    if (!this.config) {
      this.config = await Configuration.acquire(this.credentials);
    }
    return this.config;
  }

  /** Authorization Code Grant */
  protected async authorize(): Promise<Token | undefined> {
    const {
      scope,
      redirect_uri,
      parameters: additionalParameters
    } = this.credentials;

    return new Promise((resolve, reject) => {
      const code_verifier = OpenIDClient.randomPKCECodeVerifier();
      OpenIDClient.calculatePKCECodeChallenge(code_verifier).then(
        async (code_challenge) => {
          let state: string | undefined = undefined;
          const parameters: Record<string, string> = {
            ...additionalParameters,
            redirect_uri,
            code_challenge,
            code_challenge_method: 'S256' // TODO make code challenge method configurable?
          };

          if (scope) {
            parameters.scope = scope;
          }
          if (
            !(await this.getConfiguration()).serverMetadata().supportsPKCE()
          ) {
            state = OpenIDClient.randomState();
            parameters.state = state;
          }

          await Localhost.redirectServer({
            ...this.credentials,
            authorization_url: OpenIDClient.buildAuthorizationUrl(
              await this.getConfiguration(),
              parameters
            ).href,
            code_verifier,
            state,
            resolve: (async (response?: OpenIDClient.TokenEndpointResponse) => {
              this.token = Token.fromResponse(response);
              if (this.token && this.store) {
                await this.store.save(this.token);
              }
              resolve(this.token);
            }).bind(this),
            reject
          });
        }
      );
    });
  }

  /**
   * Make an authorized request to the API, acquiring an unexpired acess token
   * if necessary.
   */
  public async request(
    url: URL | string,
    method: string = 'GET',
    body?: OpenIDClient.FetchBody,
    headers?: Headers,
    dPoPOptions?: OpenIDClient.DPoPOptions
  ) {
    for (const header in this.credentials.headers) {
      headers?.append(header, this.credentials.headers[header]);
    }
    return await OpenIDClient.fetchProtectedResource(
      await this.getConfiguration(),
      (await this.getToken())!.access_token,
      new URL(url),
      method,
      body,
      headers,
      dPoPOptions
    );
  }

  /**
   * Make an authorized request to the API, acquiring an unexpired acess token
   * if necessary.
   *
   * This converts the Fetch API request into an OpenID request. To directly
   * make this request, use {@link request()}
   */
  public async fetch(
    endpoint: string | URL | Request,
    init?: RequestInit
  ): Promise<Response> {
    return this.request(
      endpoint.toString(),
      init?.method,
      init?.body?.toString(),
      new Headers(init?.headers)
    );
  }

  /**
   * Make an authorized request to the API, acquiring an unexpired acess token
   * if necessary and parse the JSON respomse.
   *
   * @param validator Optional validator function test that the JSON response is
   *   the expected type.
   */
  public async requestJSON<T extends JSONValue = JSONValue>(
    url: URL | string,
    method: string = 'GET',
    body?: OpenIDClient.FetchBody,
    headers?: Headers,
    dPoPOptions?: OpenIDClient.DPoPOptions
  ) {
    return (await (
      await this.request(url, method, body, headers, dPoPOptions)
    ).json()) as T;
  }

  /**
   * Make an authorized request to the API, acquiring an unexpired acess token
   * if necessary and parse the JSON respomse.
   *
   * This converts the Fetch API request into an OpenID request. To directly
   * make this request, use {@link requestJSON()}
   */
  public async fetchJSON<T extends JSONValue = JSONValue>(
    endpoint: string | URL | Request,
    init?: RequestInit
  ) {
    return (await (await this.fetch(endpoint, init)).json()) as T;
  }
}
