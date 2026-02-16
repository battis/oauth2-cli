import { isRecord } from '@battis/typescript-tricks';
import type { FetchBody } from 'openid-client';

export type ish =
  | FetchBody
  | FormData
  | Record<string, string>
  | RequestInit['body'];

function isString(obj: unknown): obj is string {
  return typeof obj === 'string';
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
  } else if (isRecord<string, string>(body, isString, isString)) {
    return new URLSearchParams(body);
  }
  return new Response(body).arrayBuffer();
}
