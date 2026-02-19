import { URL } from 'requestish';
import * as Scope from './Scope.js';

export type Credentials = {
  client_id: string;
  client_secret: string;
  redirect_uri: URL.ish;
  scope?: Scope.ish;
} & (
  | {
      issuer?: URL.ish;
      authorization_endpoint: URL.ish;
      token_endpoint: URL.ish;
    }
  | {
      issuer: URL.ish;
      authorization_endpoint?: URL.ish;
      token_endpoint?: URL.ish;
    }
);
