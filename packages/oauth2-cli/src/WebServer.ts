import { PathString } from '@battis/descriptive-types';
import { Colors } from '@qui-cli/colors';
import express, { Request, Response } from 'express';
import * as gcrtl from 'gcrtl';
import fs from 'node:fs';
import path from 'node:path';
import * as OpenIDClient from 'openid-client';
import ora, { Ora } from 'ora';
import { URL } from 'requestish';
import { Client } from './Client.js';
import { Token } from './index.js';

export type Options = {
  client: Client;

  /** See {@link Session.setViews setViews()} */
  views?: PathString;
  /**
   * Local web server launch endpoint
   *
   * This is separate and distinct from the OpenID/OAuth server's authorization
   * endpoint. This endpoint is the first path that the user is directed to in
   * their browser. It can present an explanation of what is being authorized
   * and why. By default it redirects to the OpenID/OAuth server's authorization
   * URL, the first step in the Authorization Code Grant flow.
   */

  launch_endpoint?: PathString;

  /**
   * The number of milliseconds of inactivity before a socket is presumed to
   * have timed out. This can be reduced to limit potential wait times during
   * interactive authentication, but must still be long enough to allow time for
   * the authorization code to be exchanged for an access token.
   *
   * Defaults to 1000 milliseconds
   */
  timeout?: number;
};

let ejs: MinimalEJS | undefined = undefined;
try {
  ejs = (await import('ejs')).default;
} catch (_) {
  // ignore error
}

export const DEFAULT_LAUNCH_ENDPOINT = '/oauth2-cli/authorize';

/**
 * Minimal HTTP server running on localhost to handle the redirect step of
 * OpenID/OAuth flows
 */
export class Session {
  private static activePorts: string[] = [];

  /** PKCE code_verifier */
  public readonly code_verifier = OpenIDClient.randomPKCECodeVerifier();

  /** OAuth 2.0 state (if PKCE is not supported) */
  public readonly state = OpenIDClient.randomState();

  private client: Client;

  private views?: PathString;
  private packageViews = '../views';

  private spinner: Ora;

  protected readonly port: string;

  public readonly launch_endpoint: PathString;

  private server;

  private resolveAuthorizationCodeFlow?: (response: Token.Response) => void =
    undefined;
  private rejectAuthorizationCodeFlow?: (error: Error) => void = undefined;

  public constructor({
    client,
    views,
    launch_endpoint = DEFAULT_LAUNCH_ENDPOINT,
    timeout = 1000 // milliseconds
  }: Options) {
    this.client = client;
    this.spinner = ora(
      `Awaiting interactive authorization for ${this.client.name}`
    ).start();
    this.launch_endpoint = launch_endpoint;
    this.views = views;
    const url = URL.from(this.client.credentials.redirect_uri);
    this.port = url.port;
    if (Session.activePorts.includes(this.port)) {
      throw new Error(
        `Another process is already running at http://localhost:${url.port}.`,
        { cause: { activePorts: Session.activePorts } }
      );
    }
    Session.activePorts.push(this.port);
    const app = express();
    app.get(this.launch_endpoint, this.handleAuthorizationEndpoint.bind(this));
    app.get(gcrtl.path(url), this.handleRedirect.bind(this));
    this.server = app.listen(gcrtl.port(url));
    this.server.timeout = timeout;
    this.server.keepAliveTimeout = 0;
    this.server.keepAliveTimeoutBuffer = 0;
  }

  public async authorizationCodeGrant() {
    const response = new Promise<Token.Response>((resolve, reject) => {
      this.resolveAuthorizationCodeFlow = resolve;
      this.rejectAuthorizationCodeFlow = reject;
    });
    this.spinner.text = `Please continue interactive authorization for ${this.client.name} at ${Colors.url(
      gcrtl.expand(this.launch_endpoint, this.client.credentials.redirect_uri)
    )} in your browser`;
    await response;
    this.spinner.text = 'Waiting on server shut down';
    await this.close();
    return response;
  }

  /**
   * Set the path to folder of *.ejs templates
   *
   * Expected templates include:
   *
   * - `authorize.ejs` presents information prior to the authorization to the
   *   user, and the user must follow `authorize_url` data property to
   *   interactively initiate authorization
   * - `complete.ejs` presented to user upon successful completion of
   *   authorization flow
   * - `error.ejs` presented to user upon receipt of an error from the server,
   *   includes `error` as data
   *
   * `complete.ejs` and `error.ejs` are included with oauth2-cli and those
   * templates will be used if `ejs` is imported but no replacement templates
   * are found.
   *
   * @param views Should be an absolute path
   */
  public setViews(views: PathString) {
    this.views = views;
  }

  protected async render(
    res: Response,
    template: string,
    data: Record<string, unknown> = {}
  ) {
    const name = this.client.name;
    async function attemptToRender(views?: PathString) {
      if (ejs && views) {
        const viewPath = path.resolve(import.meta.dirname, views, template);
        if (fs.existsSync(viewPath)) {
          res.send(await ejs.renderFile(viewPath, { name, ...data }));
          return true;
        }
      }
      return false;
    }
    return (
      (await attemptToRender(this.views)) ||
      (await attemptToRender(this.packageViews))
    );
  }

  /** Handles request to `/authorize` */
  protected async handleAuthorizationEndpoint(req: Request, res: Response) {
    this.spinner.text = `Interactively authorizing ${this.client.name} in browser`;
    const authorization_url = URL.toString(
      await this.client.getAuthorizationUrl(this)
    );
    if (!(await this.render(res, 'authorize.ejs', { authorization_url }))) {
      res.redirect(authorization_url);
      res.end();
    }
  }

  /** Handles request to `redirect_uri` */
  protected async handleRedirect(req: Request, res: Response) {
    this.spinner.text = `Exchanging authorization code for ${this.client.name} access token`;
    try {
      if (this.resolveAuthorizationCodeFlow) {
        this.resolveAuthorizationCodeFlow(
          await this.client.handleAuthorizationCodeRedirect(req, this)
        );
        this.spinner.text = 'Authorization complete and access token received';
        if (!(await this.render(res, 'complete.ejs'))) {
          res.send(
            `${this.client.name} authorization complete. You may close this window.`
          );
        }
      } else {
        throw new Error(
          `WebServer.resolver is ${this.resolveAuthorizationCodeFlow}`
        );
      }
    } catch (error) {
      if (this.rejectAuthorizationCodeFlow) {
        this.rejectAuthorizationCodeFlow(
          new Error('WebServer could not handle redirect', { cause: error })
        );
      }
      if (!(await this.render(res, 'error.ejs', { error }))) {
        res.send({
          client: this.client.name,
          error
        });
      }
    }
  }

  /** Shut down web server */
  public async close() {
    return new Promise<void>((resolve, reject) => {
      this.server.close((cause?: Error) => {
        if (cause) {
          const message = `Error shutting down ${this.client.name} out-of-band redirect web server`;
          this.spinner.fail(
            `Error shutting down ${this.client.name} out-of-band redirect web server`
          );
          reject(
            new Error(message, {
              cause
            })
          );
        } else {
          Session.activePorts.splice(Session.activePorts.indexOf(this.port), 1);
          this.spinner.succeed('Authorization complete');
          resolve();
        }
      });
    });
  }
}
