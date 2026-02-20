import { PathString } from '@battis/descriptive-types';
import { Client } from '../index.js';

export type Options = {
  client: Client;

  /** See {@link Session.setViews setViews()} */
  views?: PathString;
  /**
   * Local web server launch endpoint
   *
   * This is separate and distinct from the OpenID/OAuth server's authorization
   * endpoint. This endpoint is the first path that the user is directed to in
   * their browser. It can present an explanation of what is being authorized
   * and why. By default it redirects to the OpenID/OAuth server's authorization
   * URL, the first step in the Authorization Code Grant flow.
   */
  launch_endpoint?: PathString;

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
