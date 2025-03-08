// TODO replace node-fetch dependency with native fetch when bumping to node@>=21
import nodeFetch, { RequestInfo, RequestInit } from 'node-fetch';
import * as OAuth2 from 'oauth2-cli';

export type Credentials = Omit<
  OAuth2.Credentials,
  'authorization_endpoint' | 'token_endpoint'
> & {
  subscription_key: string;
};

const SUBSCRIPTION_HEADER = 'Bb-Api-Subscription-Key';

export class SkyAPI {
  private client: OAuth2.Client;
  private token?: OAuth2.Token;
  private subscription_key: string;

  public constructor(credentials: Credentials) {
    this.client = new OAuth2.Client({
      ...credentials,
      authorization_endpoint: 'https://app.blackbaud.com/oauth/authorize',
      token_endpoint: 'https://oauth2.sky.blackbaud.com/token',
      headers: { [SUBSCRIPTION_HEADER]: credentials.subscription_key }
    });
    this.subscription_key = credentials.subscription_key;
  }

  public async getToken() {
    this.token = await this.client.getToken();
    return this.token;
  }

  public async fetch(endpoint: URL | RequestInfo, init?: RequestInit) {
    await this.getToken();
    if (!this.token) {
      throw new Error('No access token');
    }
    return await (
      await nodeFetch(new URL(endpoint, 'https://api.sky.blackbaud.com'), {
        ...init,
        headers: {
          ...init?.headers,
          Authorization: `Bearer ${this.token.access_token}`,
          [SUBSCRIPTION_HEADER]: this.subscription_key
        }
      })
    ).json();
  }
}
