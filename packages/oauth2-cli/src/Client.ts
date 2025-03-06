import * as Configuration from '@battis/oauth2-configure';
import { Mutex } from 'async-mutex';
import * as OpenIDClient from 'openid-client';
import { FileStorage } from './FileStorage.js';
import * as Localhost from './Localhost.js';
import { Token } from './Token.js';
import { TokenStorage } from './TokenStorage.js';

export type Options = Configuration.Options & {
  scope?: string;
  headers?: Record<string, string>;
  parameters?: Record<string, string>;
  store?: TokenStorage | string;
};

export class Client {
  private tokenMutex = new Mutex();
  private token?: Token;
  private store?: TokenStorage;

  public constructor(private options: Options) {
    if (this.options.store) {
      if (typeof this.options.store === 'string') {
        this.store = new FileStorage(this.options.store);
      } else {
        this.store = this.options.store;
      }
    }
  }

  public async getToken() {
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

  private async refreshToken(token: Token): Promise<Token | undefined> {
    if (token.refresh_token) {
      const { headers, parameters } = this.options;
      let freshTokens;
      if (
        (freshTokens = Token.fromResponse(
          await OpenIDClient.refreshTokenGrant(
            await Configuration.acquire(this.options),
            token.refresh_token,
            parameters,
            // @ts-expect-error 2322 undocumented arg pass-through to oauth4webapi
            { headers }
          )
        ))
      ) {
        return this.store?.save(freshTokens) || freshTokens;
      }
    }
    return this.authorize();
  }

  private async authorize(): Promise<Token | undefined> {
    const {
      scope,
      redirect_uri,
      parameters: additionalParameters
    } = this.options;

    return new Promise(async (resolve, reject) => {
      const configuration = await Configuration.acquire(this.options);
      const code_verifier = OpenIDClient.randomPKCECodeVerifier();
      const code_challenge =
        await OpenIDClient.calculatePKCECodeChallenge(code_verifier);
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
      if (!configuration.serverMetadata().supportsPKCE()) {
        state = OpenIDClient.randomState();
        parameters.state = state;
      }

      await Localhost.redirectServer({
        ...this.options,
        authorization_url: OpenIDClient.buildAuthorizationUrl(
          configuration,
          parameters
        ).href,
        code_verifier,
        state,
        resolve: (async (response?: OpenIDClient.TokenEndpointResponse) => {
          const token = Token.fromResponse(response);
          if (token && this.store) {
            await this.store.save(token);
          }
          resolve(token);
        }).bind(this),
        reject
      });
    });
  }
}
