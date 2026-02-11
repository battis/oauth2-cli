import { Env } from '@qui-cli/env';
import { Token } from 'oauth2-cli';

export class EnvironmentStorage implements Token.TokenStorage {
  public constructor(private tokenEnvVar = 'ACCESS_TOKEN') {}

  public async load(): Promise<Token.Response | undefined> {
    try {
      const response = Token.TokenResponseJSON.parse(
        (await Env.get({ key: this.tokenEnvVar })) || ''
      );
      if (!response.access_token) {
        throw new Error('No access token');
      }
      return response;
    } catch (_) {
      return undefined;
    }
  }

  public async save(tokens: Token.Response): Promise<void> {
    await Env.set({ key: this.tokenEnvVar, value: JSON.stringify(tokens) });
  }
}
