/**
 * Reaching into the bowels of openid-client to be able to fully de-serialize a
 * serialized token response
 */
import * as oauth from 'oauth4webapi';
import { TokenEndpointResponseHelpers } from 'openid-client';

/** @see https://github.com/panva/openid-client/blob/79386b7f120dc9bdc7606886a26e4ea7d011ee51/src/index.ts#L1981-L2016 */
function getHelpers(response: oauth.TokenEndpointResponse) {
  let exp: number | undefined = undefined;
  if (response.expires_in !== undefined) {
    const now = new Date();
    now.setSeconds(now.getSeconds() + response.expires_in);
    exp = now.getTime();
  }

  return {
    expiresIn: {
      __proto__: null,
      value() {
        if (exp) {
          const now = Date.now();
          if (exp > now) {
            return Math.floor((exp - now) / 1000);
          }

          return 0;
        }

        return undefined;
      }
    },
    claims: {
      __proto__: null,
      value(this: oauth.TokenEndpointResponse) {
        try {
          return oauth.getValidatedIdTokenClaims(this);
        } catch {
          return undefined;
        }
      }
    }
  };
}

/** @see https://github.com/panva/openid-client/blob/79386b7f120dc9bdc7606886a26e4ea7d011ee51/src/index.ts#L2018-L2022 */
export function addHelpers(
  response: oauth.TokenEndpointResponse
): asserts response is typeof response & TokenEndpointResponseHelpers {
  Object.defineProperties(response, getHelpers(response));
}
