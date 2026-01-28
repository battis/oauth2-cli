import { PathString } from '@battis/descriptive-types';
import express, { Request, Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import * as Errors from './Errors/index.js';
import * as Req from './Request/index.js';
import { Session } from './Session.js';

export type Options = {
  session: Session;
  /** {@link WebServer.setViews see setViews()} */
  views?: PathString;
  authorize_endpoint?: PathString;
};

let ejs: MinimalEJS | undefined = undefined;
try {
  ejs = (await import('ejs')).default;
} catch (_) {
  // ignore error
}

export const DEFAULT_AUTHORIZE_ENDPOINT = '/oauth2-cli/authorize';

export interface WebServerInterface {
  readonly authorization_endpoint: PathString;
}

/**
 * Minimal HTTP server running on localhost to handle the redirect step of
 * OpenID/OAuth flows
 */
export class WebServer implements WebServerInterface {
  private static ports: string[] = [];

  protected readonly session: Session;
  private views: PathString;
  private viewsFallback = '../views';
  protected readonly port: string;
  public readonly authorization_endpoint: PathString;
  private server;

  public constructor({
    session,
    views = '../views',
    authorize_endpoint = DEFAULT_AUTHORIZE_ENDPOINT
  }: Options) {
    this.session = session;
    this.authorization_endpoint = authorize_endpoint;
    this.views = views;
    const url = Req.URL.from(this.session.redirect_uri);
    this.port = url.port;
    if (WebServer.ports.includes(this.port)) {
      throw new Errors.PortCollision(url.port);
    }
    WebServer.ports.push(this.port);
    const app = express();
    app.get(this.authorization_endpoint, this.authorize.bind(this));
    app.get(url.pathname, this.redirect.bind(this));
    this.server = app.listen(url.port);
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
    async function renderIfExists(views: PathString) {
      if (ejs) {
        const viewPath = path.resolve(import.meta.dirname, views, template);
        if (fs.existsSync(viewPath)) {
          res.send(await ejs.renderFile(viewPath, data));
          return true;
        }
      }
      return false;
    }
    return (
      (await renderIfExists(this.views)) ||
      (await renderIfExists(this.viewsFallback))
    );
  }

  /** Handles request to `/authorize` */
  protected async authorize(req: Request, res: Response) {
    const authorization_url = await this.session.getAuthorizationUrl();
    if (!(await this.render(res, 'authorize.ejs', { authorization_url }))) {
      res.redirect(authorization_url);
    }
  }

  /** Handles request to `redirect_uri` */
  protected async redirect(req: Request, res: Response) {
    try {
      await this.session.handleRedirect(req);
      if (!(await this.render(res, 'complete.ejs'))) {
        res.send('You may close this window.');
      }
    } catch (error) {
      if (!(await this.render(res, 'error.ejs', { error }))) {
        res.send(error);
      }
    } finally {
      this.close();
    }
  }

  /** Close server */
  public async close() {
    return new Promise<void>((resolve, reject) => {
      this.server.close((err?: Error) => {
        if (err) {
          reject(err);
        } else {
          WebServer.ports.splice(WebServer.ports.indexOf(this.port), 1);
          resolve();
        }
      });
    });
  }
}
