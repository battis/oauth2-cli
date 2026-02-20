import { URL } from 'requestish';
import { Scope } from './Token/index.js';

export type Credentials = {
  /** OAuth 2.0 / OpenID Connect `client_id` value */
  client_id: string;

  /** OAuth 2.0 / OpenID Connect `client_secret` value */
  client_secret: string;

  /**
   * OAuth 2.0 / OpenID Connect `redirect_uri` value
   *
   * This must either be a URL of the form `http://localhost` or redirect to
   * `http://localhost` for the client to be able to provide support for it. If
   * SSL encryption is required, you must provide that configuration
   * independently.
   */
  redirect_uri: URL.ish;

  /** OAuth 2.0 / OpenID Connect access `scope` value */
  scope?: Scope.ish;
} & (
  | {
      /**
       * Optional OpenID Connect `issuer` to use for the well-known URL
       * discovery process
       */
      issuer?: URL.ish;

      /**
       * OAuth 2.0 `authorization_endpoint` URL to for during Authorization Code
       * flow
       */

      authorization_endpoint: URL.ish;
      /**
       * OAuth 2.0 `authorization_endpoint` URL to for during Authorization Code
       * flow
       */
      token_endpoint: URL.ish;
    }
  | {
      /** OpenID Connect `issuer` to use for the well-known URL discovery process */
      issuer: URL.ish;

      /**
       * Optional OAuth 2.0 `authorization_endpoint` URL to for during
       * Authorization Code flow
       */
      authorization_endpoint?: URL.ish;

      /**
       * Optional OAuth 2.0 `authorization_endpoint` URL to for during
       * Authorization Code flow
       */
      token_endpoint?: URL.ish;
    }
);
