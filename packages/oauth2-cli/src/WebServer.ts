import { PathString } from '@battis/descriptive-types';
import express, { Request, Response } from 'express';
import * as gcrtl from 'gcrtl';
import fs from 'node:fs';
import path from 'node:path';
import * as requestish from 'requestish';
import { Session } from './Session.js';

export type WebServerOptions = {
  session: Session;
  /** See {@link WebServer.setViews setViews()} */
  views?: PathString;
  /**
   * Local web server authorize endpoint
   *
   * This is separate and distinct from the OpenID/OAuth server's authorization
   * endpoint. This endpoint is the first path that the user is directed to in
   * their browser. It can present an explanation of what is being authorized
   * and why. By default it redirects to the OpenID/OAuth server's authorization
   * URL, the first step in the Authorization Code Grant flow.
   */

  authorize_endpoint?: PathString;

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

export const DEFAULT_AUTHORIZE_ENDPOINT = '/oauth2-cli/authorize';

export interface WebServerInterface {
  /** See {@link WebServerOptions} */
  readonly authorization_endpoint: PathString;

  /** Shut down web server */
  close(): Promise<void>;
}

/**
 * Minimal HTTP server running on localhost to handle the redirect step of
 * OpenID/OAuth flows
 */
export class WebServer implements WebServerInterface {
  private static activePorts: string[] = [];

  protected readonly session: Session;
  private views?: PathString;
  private packageViews = '../views';
  protected readonly port: string;
  public readonly authorization_endpoint: PathString;
  private server;

  public constructor({
    session,
    views,
    authorize_endpoint = DEFAULT_AUTHORIZE_ENDPOINT,
    timeout = 1000 // milliseconds
  }: WebServerOptions) {
    this.session = session;
    this.authorization_endpoint = authorize_endpoint;
    this.views = views;
    const url = requestish.URL.from(this.session.redirect_uri);
    this.port = url.port;
    if (WebServer.activePorts.includes(this.port)) {
      throw new Error(
        `Another process is already running at http://localhost:${url.port}.`,
        { cause: { activePorts: WebServer.activePorts } }
      );
    }
    WebServer.activePorts.push(this.port);
    const app = express();
    app.get(
      this.authorization_endpoint,
      this.handleAuthorizationEndpoint.bind(this)
    );
    app.get(gcrtl.path(url), this.handleRedirect.bind(this));
    this.server = app.listen(gcrtl.port(url));
    this.server.timeout = timeout;
    this.server.keepAliveTimeout = 0;
    this.server.keepAliveTimeoutBuffer = 0;
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
    const name = this.session.client.clientName();
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
    const authorization_url = await this.session.getAuthorizationUrl();
    if (!(await this.render(res, 'authorize.ejs', { authorization_url }))) {
      res.redirect(authorization_url);
      res.end();
    }
  }

  /** Handles request to `redirect_uri` */
  protected async handleRedirect(req: Request, res: Response) {
    try {
      await this.session.handleAuthorizationCodeRedirect(req);
      if (!(await this.render(res, 'complete.ejs'))) {
        res.send(
          `${this.session.client.clientName()} authorization complete. You may close this window.`
        );
      }
    } catch (error) {
      if (!(await this.render(res, 'error.ejs', { error }))) {
        res.send({
          client: this.session.client.clientName(),
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
          reject(
            new Error(
              `Error shutting down ${this.session.client.clientName()} out-of-band redirect web server`,
              {
                cause
              }
            )
          );
        } else {
          WebServer.activePorts.splice(
            WebServer.activePorts.indexOf(this.port),
            1
          );
          resolve();
        }
      });
    });
  }
}
