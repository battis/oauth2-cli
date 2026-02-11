import * as Req from './Request/index.js';

export type OAuth2 = {
  client_id: string;
  client_secret: string;
  redirect_uri: Req.URL.ish;
  authorization_endpoint: Req.URL.ish;
  token_endpoint: Req.URL.ish;
  scope?: Req.Scope.ish;
};

export type OpenID = {
  issuer: Req.URL.ish;
  client_id: string;
  client_secret: string;
  redirect_uri: Req.URL.ish;
};

export type Combined = {
  client_id: string;
  client_secret: string;
  redirect_uri: Req.URL.ish;
  scope?: Req.Scope.ish;
} & (
  | {
      issuer?: Req.URL.ish;
      authorization_endpoint: Req.URL.ish;
      token_endpoint: Req.URL.ish;
    }
  | {
      issuer: Req.URL.ish;
      authorization_endpoint?: Req.URL.ish;
      token_endpoint?: Req.URL.ish;
    }
);
