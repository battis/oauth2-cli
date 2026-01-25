import { Env } from '@qui-cli/env-1password';
import { Token, TokenStorage } from 'oauth2-cli';
import { TokenEndpointResponse } from 'openid-client';

export class EnvironmentStorage implements TokenStorage {
  public constructor(private tokenEnvVar = 'ACCESS_TOKEN') {}

  public async load(): Promise<Token | undefined> {
    try {
      const data = JSON.parse(
        (await Env.get({ key: this.tokenEnvVar })) || ''
      ) as TokenEndpointResponse;
      if (!data.access_token) {
        throw new Error('No access token');
      }
      return Token.fromResponse(data);
    } catch (_) {
      return undefined;
    }
  }

  public async save(tokens: Token): Promise<void> {
    await Env.set({ key: this.tokenEnvVar, value: JSON.stringify(tokens) });
  }
}
