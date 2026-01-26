import * as OpenIDClient from 'openid-client';

export type Response = OpenIDClient.TokenEndpointResponse &
  OpenIDClient.TokenEndpointResponseHelpers;
