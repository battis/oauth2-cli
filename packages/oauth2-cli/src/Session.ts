import { PathString } from '@battis/descriptive-types';
import { Request } from 'express';
import open from 'open';
import * as OpenIDClient from 'openid-client';
import { ClientInterface } from './Client.js';
import { MissingAccessToken } from './Errors/MissingAccessToken.js';
import * as Req from './Request/index.js';
import * as Token from './Token/index.js';
import * as WebServer from './WebServer.js';

export type Options = {
  client: ClientInterface;
  /** See {@link WebServer.setViews Webserver.setViews()} */
  views?: PathString;
  /** Additional request injection for authorization code grant flow */
  request?: Req.Injection;
};

export interface SessionInterface {
  readonly code_verifier: string;
  readonly state: string;
  readonly request?: Req.Injection;
  resolve(response?: Token.Response, error?: Error): void | Promise<void>;
  requestAuthorizationCode(): Promise<Token.Response>;
  createWebServer(
    options: Omit<WebServer.Options, 'session'>
  ): WebServer.WebServerInterface;
}

export class Session implements SessionInterface {
  private readonly client: ClientInterface;
  private readonly server: WebServer.WebServerInterface;
  public readonly state = OpenIDClient.randomState();
  public readonly code_verifier = OpenIDClient.randomPKCECodeVerifier();
  public readonly request?: Req.Injection;

  private _callback?: SessionInterface['resolve'];
  public get resolve() {
    if (!this._callback) {
      throw new Error('callback is missing');
    }
    return this._callback;
  }

  public constructor({ client, views, request }: Options) {
    this.client = client;
    this.request = request;
    this.server = this.createWebServer({ views });
  }

  public createWebServer(
    options: Omit<WebServer.Options, 'session'>
  ): WebServer.WebServerInterface {
    return new WebServer.WebServer({ session: this, ...options });
  }

  public requestAuthorizationCode() {
    return new Promise<Token.Response>((resolve, reject) => {
      this._callback = async (response, error) => {
        if (error) {
          reject(error);
        }
        if (response) {
          resolve(response);
        } else {
          reject(new MissingAccessToken());
        }
      };
      open(
        new URL(
          this.server.authorization_endpoint,
          this.client.redirect_uri
        ).toString()
      );
    });
  }

  public get redirect_uri() {
    return this.client.redirect_uri;
  }

  public async getAuthorizationUrl() {
    return (await this.client.getAuthorizationUrl(this)).toString();
  }

  public async handleRedirect(req: Request) {
    return await this.client.handleRedirect(req, this);
  }
}
