import { URL } from 'requestish';
import { Credentials } from './Credentials.js';
import { Injection } from './Injection.js';
import * as Localhost from './Localhost/index.js';
import * as Token from './Token/index.js';

export type LocalhostOptions = Omit<Localhost.Options, 'client'>;

export type Client<C extends Credentials = Credentials> = {
  /** Human-readable name for client in messages */
  name?: string;

  /** Credentials for server access */
  credentials: C;

  /** Optional request components to inject */
  inject?: Injection;

  /** Base URL for all non-absolute requests */
  base_url?: URL.ish;

  /** Optional {@link TokenStorage} implementation to manage tokens */
  storage?: Token.Storage;

  /**
   * Optional configuration for localhost web server listening for authorization
   * code redirect
   */
  localhost?: LocalhostOptions;
};

export type Refresh = {
  /**
   * Optional refresh token
   *
   * If using {@link TokenStorage}, the refresh token should be stored with the
   * access token and does not need to be separately managed and stored
   */
  refresh_token?: string;

  /** Additional request injection for refresh grant flow */
  inject?: Injection;
};

export type GetToken = {
  /**
   * Optional access token
   *
   * If using {@link TokenStorage}, the access token does not need to be
   * separately managed and stored
   */
  token?: Token.Response;

  /**
   * Additional request injection for authorization code grant and/or refresh
   * grant flows
   */
  inject?: Injection;
};
