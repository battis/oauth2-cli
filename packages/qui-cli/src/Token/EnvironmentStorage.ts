import { Env } from '@qui-cli/env';
import { Token } from 'oauth2-cli';

/**
 * Persist a refresh token in the local environment
 *
 * Care should be taken when using this persistence strategy to:
 *
 * 1. Ideally encrypt or otherwise secure the environment value (see
 *    {@link https://github.com/battis/oauth2-cli/tree/main/examples/qui-cli/04%201password-integration#readme 1password-integration}
 *    example for one approach)
 * 2. Do not commit `.env` files to a public repo
 */
export class EnvironmentStorage implements Token.Storage {
  /**
   * @param tokenEnvVar Name of the environment variable containing the refresh
   *   token, defaults to `REFRESH_TOKEN`
   */
  public constructor(private tokenEnvVar = 'REFRESH_TOKEN') {}

  public async load(): Promise<string | undefined> {
    return await Env.get({ key: this.tokenEnvVar });
  }

  public async save(refresh_token: string): Promise<void> {
    await Env.set({ key: this.tokenEnvVar, value: refresh_token });
  }
}
