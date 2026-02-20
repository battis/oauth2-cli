import * as OpenIDClient from 'openid-client';

/** @see {@link https://github.com/panva/openid-client/blob/79386b7f120dc9bdc7606886a26e4ea7d011ee51/src/index.ts#L4268 `openid-client` grant request return type} */
export type Response = OpenIDClient.TokenEndpointResponse &
  OpenIDClient.TokenEndpointResponseHelpers;

  