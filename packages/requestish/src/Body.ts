import type { FetchBody } from 'openid-client';
import {
  from as URLSearchParams_from,
  ish as URLSearchParams_ish
} from './URLSearchParams.js';
import { isJSONEntries, isJSONRecord } from './is.js';

export type ish =
  | FetchBody
  | FormData
  | URLSearchParams_ish
  | RequestInit['body'];

export async function from(body: ish): Promise<FetchBody | undefined> {
  if (
    body === undefined ||
    body === null ||
    typeof body === 'string' ||
    body instanceof ArrayBuffer ||
    body instanceof ReadableStream ||
    body instanceof Uint8Array ||
    body instanceof URLSearchParams
  ) {
    return body;
  } else if (isJSONRecord(body)) {
    return URLSearchParams_from(body);
  } else if (isJSONEntries(body)) {
    return URLSearchParams_from(body);
  }
  return new Response(body).arrayBuffer();
}
