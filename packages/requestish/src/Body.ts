import { isRecord, JSONPrimitive } from '@battis/typescript-tricks';
import type { FetchBody } from 'openid-client';
import { from as URLSearchParamsFrom } from './URLSearchParams.js';

export type ish =
  | FetchBody
  | FormData
  | Record<string, JSONPrimitive>
  | RequestInit['body'];

function isString(obj: unknown): obj is string {
  return typeof obj === 'string';
}

function isJSONPrimitive(obj: unknown): obj is JSONPrimitive {
  return (
    typeof obj === 'string' ||
    typeof obj === 'number' ||
    typeof obj === 'boolean'
  );
}

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
  } else if (isRecord<string, JSONPrimitive>(body, isString, isJSONPrimitive)) {
    return URLSearchParamsFrom(body);
  }
  return new Response(body).arrayBuffer();
}
