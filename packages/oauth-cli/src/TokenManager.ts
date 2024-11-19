import { Mutex } from 'async-mutex';
import * as client from 'openid-client';
import * as Configuration from './Configuration.js';
import { FileStorage } from './FileStorage.js';
import * as Localhost from './Localhost.js';
import { StorableToken, Storage } from './Storage.js';

export type Options = Configuration.Options & {
  scope?: string;
  headers?: Record<string, string>;
  parameters?: Record<string, string>;
  store?: Storage | string;
};

export class TokenManager {
  private tokenMutex = new Mutex();
  private store?: Storage;

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
    return await this.tokenMutex.runExclusive(async () => {
      let tokens: StorableToken | undefined = undefined;
      let refreshed = true;
      if (this.store) {
        tokens = await this.store.load();
        if (
          tokens &&
          tokens.expires_in &&
          this.hasExpired(tokens.timestamp, tokens.expires_in)
        ) {
          tokens = await this.refreshToken(tokens);
        } else {
          refreshed = false;
        }
      } else {
        tokens = await this.authorize();
      }

      if (refreshed && tokens && this.store) {
        await this.store.save(tokens);
      }
      return tokens;
    });
  }

  private hasExpired(timestamp: number, expires_in: number) {
    return Date.now() > timestamp + expires_in;
  }

  private async refreshToken(tokens: StorableToken): Promise<StorableToken> {
    if (!tokens.refresh_token) {
      throw new Error('No refresh token available.');
    }
    if (
      tokens.refresh_token_expires_in &&
      typeof tokens.refresh_token_expires_in === 'number' &&
      !this.hasExpired(tokens.timestamp, tokens.refresh_token_expires_in)
    ) {
      const { refresh_token } = tokens;
      const { headers, parameters } = this.options;
      const freshTokens = await client.refreshTokenGrant(
        await Configuration.acquire(this.options),
        refresh_token,
        parameters,
        // @ts-ignore FIXME undocumented arg pass-through to oauth4webapi
        { headers }
      );
      if (!freshTokens) {
        throw new Error('Refresh failed to deliver fresh tokens');
      }
      if (refresh_token) {
        return {
          timestamp: Date.now(),
          ...(freshTokens as client.TokenEndpointResponse)
        };
      }
    }
    return this.authorize();
  }

  private async authorize(): Promise<StorableToken> {
    const {
      scope,
      redirect_uri,
      parameters: additionalParameters
    } = this.options;

    return new Promise(async (resolve, reject) => {
      const configuration = await Configuration.acquire(this.options);
      const code_verifier = client.randomPKCECodeVerifier();
      const code_challenge =
        await client.calculatePKCECodeChallenge(code_verifier);
      let state: string | undefined = undefined;
      const parameters: Record<string, string> = {
        ...additionalParameters,
        redirect_uri,
        code_challenge,
        code_challenge_method: 'S256'
      };

      if (scope) {
        parameters.scope = scope;
      }
      if (!configuration.serverMetadata().supportsPKCE()) {
        state = client.randomState();
        parameters.state = state;
      }

      await Localhost.redirectServer({
        ...this.options,
        code_verifier,
        state,
        resolve,
        reject
      });

      const authorizationUrl = client.buildAuthorizationUrl(
        configuration,
        parameters
      );
      const { default: open } = await import('open');
      if (open) {
        open(authorizationUrl.href);
      }
      console.log(
        `Please authorize this app in your web browser: ${authorizationUrl}`
      );
    });
  }
}
