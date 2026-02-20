import { PathString } from '@battis/descriptive-types';
import { Colors } from '@qui-cli/colors';
import express, { Request, Response } from 'express';
import * as gcrtl from 'gcrtl';
import fs from 'node:fs';
import * as OpenIDClient from 'openid-client';
import ora, { Ora } from 'ora';
import path from 'path';
import { URL } from 'requestish';
import { Client } from '../Client.js';
import * as Token from '../Token/index.js';
import { DEFAULT_LAUNCH_ENDPOINT } from './Defaults.js';
import { Options } from './Options.js';

let ejs: MinimalEJS | undefined = undefined;
try {
  ejs = (await import('ejs')).default;
} catch (_) {
  // ejs peer dependency not installed
}

/**
 * Minimal HTTP server running on localhost to handle the redirect step of
 * OpenID/OAuth flows
 */

export class Server {
  private static activePorts: string[] = [];

  /** PKCE code_verifier */
  public readonly code_verifier = OpenIDClient.randomPKCECodeVerifier();

  /** OAuth 2.0 state (if PKCE is not supported) */
  public readonly state = OpenIDClient.randomState();

  private client: Client;

  private views?: PathString;
  private packageViews = '../../views';

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
    if (Server.activePorts.includes(this.port)) {
      throw new Error(
        `Another process is already running at http://localhost:${url.port}.`,
        { cause: { activePorts: Server.activePorts } }
      );
    }
    Server.activePorts.push(this.port);
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
   * - `launch.ejs` presents information prior to the authorization to the user,
   *   and the user must follow `authorize_url` data property to interactively
   *   launch authorization
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
    const authorization_url = URL.toString(
      await this.client.buildAuthorizationUrl(this)
    );
    if (!(await this.render(res, 'launch.ejs', { authorization_url }))) {
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
        this.spinner.text = `${this.client.name} authorization complete and access token received`;
        if (!(await this.render(res, 'complete.ejs'))) {
          res.send(
            `${this.client.name} authorization complete. You may close this window.`
          );
        }
      } else {
        throw new Error(
          `${this.client.name} Localhost.Server.resolver is ${this.resolveAuthorizationCodeFlow}`
        );
      }
    } catch (error) {
      if (this.rejectAuthorizationCodeFlow) {
        this.rejectAuthorizationCodeFlow(
          new Error(
            `${this.client.name} Localhost.Server could not handle redirect`,
            {
              cause: error
            }
          )
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
          const message = `Error shutting down ${this.client.name} Localhost.Server`;
          this.spinner.fail(
            `Error shutting down ${this.client.name} Localhost.Server`
          );
          reject(
            new Error(message, {
              cause
            })
          );
        } else {
          Server.activePorts.splice(Server.activePorts.indexOf(this.port), 1);
          this.spinner.succeed(`${this.client.name} authorization complete`);
          resolve();
        }
      });
    });
  }
}
