import * as requestish from 'requestish';
import * as Scope from './Scope.js';

export type Injection = {
  /**
   * Search query parameters to include in server request (may be ovewritten by
   * computed values such as `state` or `challenge_code`)
   */
  search?: requestish.URLSearchParams.ish;
  /**
   * HTTP headers to include in server request (may be overwritten by computed
   * values such as `Authorization: Bearer <token>`)
   */
  headers?: requestish.Headers.ish;
  /**
   * HTTP request body parameters to include in server request (if request
   * method allows)
   */
  body?: requestish.Body.ish;
  /** Specific scope or scopes */
  scope?: Scope.ish;
};
