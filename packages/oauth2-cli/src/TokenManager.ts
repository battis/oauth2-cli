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
        let token = await this.store?.load();
        if (token?.hasExpired()) {
          token = await this.refreshToken(token);
        }
        return token || (await this.authorize());
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

  private async getConfiguration() {
    if (!this.config) {
      this.config = await Configuration.acquire(this.options);
    }
    return this.config;
  }

  private async authorize(): Promise<Token | undefined> {
    const {
      scope,
      redirect_uri,
      parameters: additionalParameters
    } = this.options;

    return new Promise(async (resolve, reject) => {
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
      if (!(await this.getConfiguration()).serverMetadata().supportsPKCE()) {
        state = OpenIDClient.randomState();
        parameters.state = state;
      }

      await Localhost.redirectServer({
        ...this.options,
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
    });
  }
}
