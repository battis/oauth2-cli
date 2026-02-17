import * as requestish from 'requestish';
import { Scope } from './index.js';

export type OAuth2 = {
  client_id: string;
  client_secret: string;
  redirect_uri: requestish.URL.ish;
  authorization_endpoint: requestish.URL.ish;
  token_endpoint: requestish.URL.ish;
  scope?: Scope.ish;
};

export type OpenID = {
  issuer: requestish.URL.ish;
  client_id: string;
  client_secret: string;
  redirect_uri: requestish.URL.ish;
};

export type Combined = {
  client_id: string;
  client_secret: string;
  redirect_uri: requestish.URL.ish;
  scope?: Scope.ish;
} & (
  | {
      issuer?: requestish.URL.ish;
      authorization_endpoint: requestish.URL.ish;
      token_endpoint: requestish.URL.ish;
    }
  | {
      issuer: requestish.URL.ish;
      authorization_endpoint?: requestish.URL.ish;
      token_endpoint?: requestish.URL.ish;
    }
);
