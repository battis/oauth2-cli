import * as requestish from 'requestish';
import * as Scope from './Scope.js';

export type Credentials = {
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
