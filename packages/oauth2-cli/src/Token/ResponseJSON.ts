import * as OpenIDClient from 'openid-client';
import { addHelpers } from './addHelpers.js';
import { Response } from './Response.js';

export function stringify(
  response: OpenIDClient.TokenEndpointResponse,
  replacer?: (string | number)[] | null,
  space?: string | number
) {
  return JSON.stringify(response, replacer, space);
}

export function parse(json: string): Response {
  const response = JSON.parse(json) as OpenIDClient.TokenEndpointResponse;
  addHelpers(response);
  return response;
}
