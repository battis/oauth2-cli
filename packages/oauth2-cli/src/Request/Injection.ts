import * as Body from './Body.js';
import * as Headers from './Headers.js';
import * as Scope from './Scope.js';
import * as URLSearchParams from './URLSearchParams.js';

export type Injection = {
  /**
   * Search query parameters to include in server request (may be ovewritten by
   * computed values such as `state` or `challenge_code`)
   */
  search?: URLSearchParams.ish;
  /**
   * HTTP headers to include in server request (may be overwritten by computed
   * values such as `Authorization: Bearer <token>`)
   */
  headers?: Headers.ish;
  /**
   * HTTP request body parameters to include in server request (if request
   * method allows)
   */
  body?: Body.ish;
  /** Specific scope or scopes */
  scope?: Scope.ish;
};
