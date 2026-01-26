import { PathString } from '@battis/descriptive-types';
import express, { Request, Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { PortCollision } from './Errors/PortCollision.js';
import * as Req from './Request/index.js';
import { Session } from './Session.js';

type Options = {
  session: Session;
  /** {@link WebServer.setViews see setViews()} */
  views?: PathString;
};

let ejs: MinimalEJS | undefined = undefined;
try {
  ejs = (await import('ejs')).default;
} catch (_) {
  // ignore error
}

/**
 * Minimal HTTP server running on localhost to handle the redirect step of
 * OpenID/OAuth flows
 */
export class WebServer {
  public static readonly AUTHORIZE_ENDPOINT = '/oauth2-cli/authorize';
  private static ports: string[] = [];

  protected readonly session: Session;
  private views: PathString;
  protected readonly port: string;
  private server;

  public constructor({ session, views = '../views' }: Options) {
    this.session = session;
    this.views = views;
    const url = Req.URL.toURL(this.session.redirect_uri);
    this.port = url.port;
    if (WebServer.ports.includes(this.port)) {
      throw new PortCollision(url.port);
    }
    WebServer.ports.push(this.port);
    const app = express();
    app.get(WebServer.AUTHORIZE_ENDPOINT, this.authorize.bind(this));
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
   * @param views Should be an absolute path
   */
  public setViews(views: PathString) {
    this.views = views;
  }

  protected render(
    res: Response,
    template: string,
    data?: Record<string, unknown>
  ) {
    if (ejs) {
      const viewPath = path.resolve(import.meta.dirname, this.views, template);
      if (fs.existsSync(viewPath)) {
        try {
          res.send(ejs.renderFile(viewPath, data));
          return true;
        } catch (_) {
          // ignore
        }
      }
    }
    return false;
  }

  /** Handles request to `/authorize` */
  protected async authorize(req: Request, res: Response) {
    const authorization_url = await this.session.getAuthorizationUrl();
    if (!this.render(res, 'authorize.ejs', { authorization_url })) {
      res.redirect(authorization_url);
    }
  }

  /** Handles request to `redirect_uri` */
  protected async redirect(req: Request, res: Response) {
    try {
      await this.session.handleRedirect(req);
      if (!this.render(res, 'complete.ejs')) {
        res.send('You may close this window.');
      }
    } catch (error) {
      if (!this.render(res, 'error.ejs', { error })) {
        res.send(
          JSON.stringify(
            'I think something bad happened, but have no idea what it was!'
          )
        );
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
