// TODO replace node-fetch dependency with native fetch when bumping to node@>=21
import nodeFetch, { RequestInfo, RequestInit } from 'node-fetch';
import * as oauth from 'oauth2-cli';

export type SkyAPICredentials = {
  client_id: string;
  client_secret: string;
  subscription_key: string;
  redirect_uri: string;
  store?: oauth.TokenStorage | string;
};

const SUBSCRIPTION_HEADER = 'Bb-Api-Subscription-Key';

export class SkyAPI {
  private tokenManager: oauth.TokenManager;
  private token?: oauth.Token;
  private subscription_key: string;

  public constructor(credentials: SkyAPICredentials) {
    this.tokenManager = new oauth.TokenManager({
      client_id: credentials.client_id,
      client_secret: credentials.client_secret,
      redirect_uri: credentials.redirect_uri,
      authorization_endpoint: 'https://app.blackbaud.com/oauth/authorize',
      token_endpoint: 'https://oauth2.sky.blackbaud.com/token',
      headers: { [SUBSCRIPTION_HEADER]: credentials.subscription_key },
      store: credentials.store
    });
    this.subscription_key = credentials.subscription_key;
  }

  public async getToken() {
    this.token = await this.tokenManager.getToken();
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
