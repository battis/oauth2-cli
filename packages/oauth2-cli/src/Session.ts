import { PathString } from '@battis/descriptive-types';
import { Request } from 'express';
import open from 'open';
import * as OpenIDClient from 'openid-client';
import { Client } from './Client.js';
import { MissingAccessToken } from './Errors/MissingAccessToken.js';
import * as Req from './Request/index.js';
import * as Token from './Token/index.js';
import { WebServer } from './WebServer.js';

type AuthorizationCodeGrantCallback = (
  response?: Token.Response,
  error?: Error
) => void | Promise<void>;

type Options = {
  client: Client;
  views?: PathString;
  request?: Req.AddOns;
};

export class Session {
  private readonly client: Client;
  private readonly server: WebServer;
  public readonly state = OpenIDClient.randomState();
  public readonly code_verifier = OpenIDClient.randomPKCECodeVerifier();
  public readonly request?: Req.AddOns;

  private _callback?: AuthorizationCodeGrantCallback;
  public get callback() {
    if (!this._callback) {
      throw new Error('callback is missing');
    }
    return this._callback;
  }

  public constructor({ client, views, request }: Options) {
    this.client = client;
    this.request = request;
    this.server = new WebServer({ session: this, views });
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
        Req.URL.toString(
          new URL(WebServer.AUTHORIZE_ENDPOINT, this.client.redirect_uri)
        )
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
