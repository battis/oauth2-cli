import { PathString } from '@battis/descriptive-types';
import { Colors } from '@qui-cli/colors';
import { Request } from 'express';
import * as gcrtl from 'gcrtl';
import * as OpenIDClient from 'openid-client';
import ora, { Ora } from 'ora';
import { Client } from './Client.js';
import { Injection } from './Injection.js';
import * as Token from './Token/index.js';
import * as WebServer from './WebServer.js';

export type SessionOptions = {
  client: Client;
  /** See {@link WebServer.setViews Webserver.setViews()} */
  views?: PathString;
  /** Additional request injection for authorization code grant flow */
  inject?: Injection;
};

export type SessionResolver = (
  response: Token.Response
) => void | Promise<void>;

export class Session {
  private readonly client: Client;
  private readonly outOfBandRedirectServer: WebServer.WebServerInterface;

  /** PKCE code_verifier */
  public readonly code_verifier = OpenIDClient.randomPKCECodeVerifier();

  /** OAuth 2.0 state (if PKCE is not supported) */
  public readonly state = OpenIDClient.randomState();

  /** Additional request injection for Authorization Code Grant request */
  public readonly inject?: Injection;

  private spinner: Ora;

  private _resolve?: SessionResolver;

  /**
   * Method that resolves or rejects the promise returned from the
   * {@link authorizationCodeGrant}
   */
  public get resolve() {
    if (!this._resolve) {
      throw new Error(`Session resolve method is ${this._resolve}`);
    }
    return this._resolve;
  }

  public reject(cause: unknown) {
    throw new Error('Session failed', { cause });
  }

  public constructor({ client, views, inject: request }: SessionOptions) {
    this.spinner = ora('Awaiting interactive authorization').start();
    this.client = client;
    this.inject = request;
    this.outOfBandRedirectServer = this.instantiateWebServer({ views });
  }

  /** Instantiate the web server that will listen for the out-of-band redirect */
  protected instantiateWebServer(
    options: Omit<WebServer.WebServerOptions, 'session'>
  ): WebServer.WebServerInterface {
    return new WebServer.WebServer({ session: this, ...options });
  }

  /**
   * Trigger the start of the Authorization Code Grant flow, returnig a Promise
   * that will resolve into the eventual token. This will close the out-of-band
   * redirect server that creating the session started.
   */
  public async authorizationCodeGrant() {
    return await new Promise<Token.Response>((resolve, reject) => {
      try {
        this._resolve = (response) => {
          let closed = false;
          this.spinner.text =
            'Waiting for out-of-band redirect server to shut down';
          this.outOfBandRedirectServer.close().then(() => {
            closed = true;
            this.spinner.succeed('Interactive authorization complete');
            resolve(response);
          });
          setTimeout(() => {
            if (!closed) {
              this.spinner.text =
                'Still waiting for out-of-band redirect server to shut down.\n' +
                '  Your browser may be holding the connection to the server open.\n\n' +
                '  Please close the "Authorization Complete" tab in your browser.';
            }
          }, 5000);
          setTimeout(() => {
            if (!closed) {
              this.spinner.text =
                'Still waiting for out-of-band redirect server to shut down.\n' +
                '  Your browser may be holding the connection to the server open.\n\n' +
                '  Please close the browser window.';
            }
          }, 10000);
          setTimeout(() => {
            if (!closed) {
              this.spinner.text =
                'Still waiting for out-of-band redirect server to shut down.\n' +
                '  Your browser may be holding the connection to the server open.\n\n' +
                '  Please quit the browser.';
            }
          }, 15000);
        };
        const url = gcrtl
          .expand(
            this.outOfBandRedirectServer.authorization_endpoint,
            this.client.redirect_uri
          )
          .toString();
        //open(url);
        this.spinner.text = `Please continue interactive authorization at ${Colors.url(url)} in your browser`;
      } catch (cause) {
        this.spinner.text =
          'Waiting for out-of-band redirect server to shut down';
        this.outOfBandRedirectServer.close().then(() => {
          this.spinner.fail('Interactive authorization failed');
          reject(new Error('Error in Authorization Code flow', { cause }));
        });
      }
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
    this.spinner.text =
      'Completing access token request with provided authorization code';
    return await this.client.handleAuthorizationCodeRedirect(req, this);
  }
}
