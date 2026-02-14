import { Env } from '@qui-cli/env';
import { Token } from 'oauth2-cli';

export class EnvironmentStorage implements Token.TokenStorage {
  public constructor(private tokenEnvVar = 'REFRESH_TOKEN') {}

  public async load(): Promise<string | undefined> {
    return await Env.get({ key: this.tokenEnvVar });
  }

  public async save(refresh_token: string): Promise<void> {
    await Env.set({ key: this.tokenEnvVar, value: refresh_token });
  }
}
