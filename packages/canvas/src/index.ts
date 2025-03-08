// TODO replace node-fetch dependency with native fetch when bumping to node@>=21
import nodeFetch, { RequestInfo, RequestInit } from 'node-fetch';
import path from 'node:path';
import * as OAuth2 from 'oauth2-cli';

export type Credentials = Omit<
  OAuth2.Credentials,
  'authorization_endpoint' | 'token_endpoint'
> & {
  instance_url: string;
};

export class Canvas {
  private client: OAuth2.Client;
  private token?: OAuth2.Token;
  private instance_url: string;

  public constructor({ instance_url, ...credentials }: Credentials) {
    this.instance_url = instance_url;
    this.client = new OAuth2.Client({
      ...credentials,
      authorization_endpoint: path.join(
        this.instance_url,
        '/login/oauth2/auth'
      ),
      token_endpoint: path.join(this.instance_url, '/login/oauth2/token')
    });
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
      await nodeFetch(new URL(endpoint, this.instance_url), {
        ...init,
        headers: {
          ...init?.headers,
          Authorization: `Bearer ${this.token.access_token}`
        }
      })
    ).json();
  }
}
