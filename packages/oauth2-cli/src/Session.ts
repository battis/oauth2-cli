import { PathString, URLString } from '@battis/descriptive-types';
import { Request } from 'express';
import open from 'open';
import * as OpenIDClient from 'openid-client';
import { ClientInterface } from './Client.js';
import * as Errors from './Errors/index.js';
import * as Req from './Request/index.js';
import * as Token from './Token/index.js';
import * as WebServer from './WebServer.js';

export type Options = {
  client: ClientInterface;
  /** See {@link WebServer.setViews Webserver.setViews()} */
  views?: PathString;
  /** Additional request injection for authorization code grant flow */
  inject?: Req.Injection;
};

export interface SessionInterface {
  /** PKCE code_verifier */
  readonly code_verifier: string;

  /** OAuth 2.0 state (if PKCE is not supported) */
  readonly state: string;

  /** Additional request injection for Authorization Code Grant request */
  readonly inject?: Req.Injection;

  /** OAuth 2.0 redirect_uri that this session is handling */
  readonly redirect_uri: ClientInterface['redirect_uri'];

  /**
   * Trigger the start of the Authorization Code Grant flow, returnig a Promise
   * that will resolve into the eventual token
   */
  authorizationCodeGrant(): Promise<Token.Response>;

  /**
   * Method that resolves or rejects the promise returned from the
   * {@link authorizationCodeGrant}
   */
  resolve(response?: Token.Response, error?: Error): void | Promise<void>;

  /**
   * The authorization URL (as a string) populated by this session's
   * Authorization Code Grant flow parameters
   */
  getAuthorizationUrl(): Promise<URLString>;

  /**
   * Express RequestHandler for the out-of-band redirect in the Authorization
   * Code Grant flow
   */
  handleAuthorizationCodeRedirect(
    req: Request
  ): ReturnType<ClientInterface['handleAuthorizationCodeRedirect']>;

  /** Instantiate the web server that will listen for the out-of-band redirect */
  createWebServer(
    options: Omit<WebServer.Options, 'session'>
  ): WebServer.WebServerInterface;
}

export class Session implements SessionInterface {
  private readonly client: ClientInterface;
  private readonly outOfBandRedirectServer: WebServer.WebServerInterface;
  public readonly state = OpenIDClient.randomState();
  public readonly code_verifier = OpenIDClient.randomPKCECodeVerifier();
  public readonly inject?: Req.Injection;

  private _resolve?: SessionInterface['resolve'];
  public get resolve() {
    if (!this._resolve) {
      throw new Error('callback is missing');
    }
    return this._resolve;
  }

  public constructor({ client, views, inject: request }: Options) {
    this.client = client;
    this.inject = request;
    this.outOfBandRedirectServer = this.createWebServer({ views });
  }

  public createWebServer(
    options: Omit<WebServer.Options, 'session'>
  ): WebServer.WebServerInterface {
    return new WebServer.WebServer({ session: this, ...options });
  }

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

  public get redirect_uri() {
    return this.client.redirect_uri;
  }

  public async getAuthorizationUrl() {
    return (await this.client.getAuthorizationUrl(this)).toString();
  }

  public async handleAuthorizationCodeRedirect(req: Request) {
    return await this.client.handleAuthorizationCodeRedirect(req, this);
  }
}
