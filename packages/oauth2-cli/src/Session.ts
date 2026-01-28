import { PathString } from '@battis/descriptive-types';
import { Request } from 'express';
import open from 'open';
import * as OpenIDClient from 'openid-client';
import { Client } from './Client.js';
import * as Errors from './Errors/index.js';
import * as Req from './Request/index.js';
import * as Token from './Token/index.js';
import * as WebServer from './WebServer.js';

export type SessionOptions = {
  client: Client;
  /** See {@link WebServer.setViews Webserver.setViews()} */
  views?: PathString;
  /** Additional request injection for authorization code grant flow */
  inject?: Req.Injection;
};

export type Resolver = (
  response?: Token.Response,
  error?: Error
) => void | Promise<void>;

export class Session {
  private readonly client: Client;
  private readonly outOfBandRedirectServer: WebServer.WebServerInterface;

  /** PKCE code_verifier */
  public readonly code_verifier = OpenIDClient.randomPKCECodeVerifier();

  /** OAuth 2.0 state (if PKCE is not supported) */
  public readonly state = OpenIDClient.randomState();

  /** Additional request injection for Authorization Code Grant request */
  public readonly inject?: Req.Injection;

  private _resolve?: Resolver;

  /**
   * Method that resolves or rejects the promise returned from the
   * {@link authorizationCodeGrant}
   */
  public get resolve() {
    if (!this._resolve) {
      throw new Error('callback is missing');
    }
    return this._resolve;
  }

  public constructor({ client, views, inject: request }: SessionOptions) {
    this.client = client;
    this.inject = request;
    this.outOfBandRedirectServer = this.createWebServer({ views });
  }

  /** Instantiate the web server that will listen for the out-of-band redirect */
  public createWebServer(
    options: Omit<WebServer.WebServerOptions, 'session'>
  ): WebServer.WebServerInterface {
    return new WebServer.WebServer({ session: this, ...options });
  }

  /**
   * Trigger the start of the Authorization Code Grant flow, returnig a Promise
   * that will resolve into the eventual token
   */
  public authorizationCodeGrant() {
    return new Promise<Token.Response>((resolve, reject) => {
      this._resolve = async (response, error) => {
        if (error) {
          reject(error);
        }
        if (response) {
          resolve(response);
        } else {
          reject(new Errors.MissingAccessToken());
        }
      };
      open(
        new URL(
          this.outOfBandRedirectServer.authorization_endpoint,
          this.client.redirect_uri
        ).toString()
      );
    });
  }

  /** OAuth 2.0 redirect_uri that this session is handling */
  public get redirect_uri() {
    return this.client.redirect_uri;
  }

  public async getAuthorizationUrl() {
    return (await this.client.getAuthorizationUrl(this)).toString();
  }

  /**
   * Express RequestHandler for the out-of-band redirect in the Authorization
   * Code Grant flow
   */
  public async handleAuthorizationCodeRedirect(req: Request) {
    return await this.client.handleAuthorizationCodeRedirect(req, this);
  }
}
