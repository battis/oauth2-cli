import { JSONPrimitive } from '@battis/typescript-tricks';
import { isJSONEntries, isJSONRecord } from './is.js';
import * as String from './String.js';

export type ish =
  | Headers
  | HeadersInit
  | Record<string, JSONPrimitive | undefined>
  | [string, JSONPrimitive | undefined][]
  | undefined;

export function from(headers?: ish): Headers {
  if (headers instanceof Headers) {
    return headers;
  } else if (isJSONRecord(headers)) {
    return new Headers(
      Object.fromEntries(
        Object.entries(headers)
          .filter(([_, value]) => value !== undefined)
          .map(([key, value]) => [key, String.from(value)])
      )
    );
  } else if (isJSONEntries(headers)) {
    return new Headers(
      headers.map(([key, value]) => [key, String.from(value)]) as [
        string,
        string
      ][]
    );
  }
  return new Headers(headers);
}

export function merge(...sources: ish[]): Headers | undefined {
  let headers: Headers | undefined = undefined;
  for (const source of sources) {
    if (source) {
      if (!headers) {
        headers = new Headers();
      }
      for (const [key, value] of from(source).entries()) {
        for (const v of value.split(', ')) {
          headers.set(key, v);
        }
      }
    }
  }
  return headers;
}

export function concatenate(...sources: ish[]): Headers | undefined {
  let headers: Headers | undefined = undefined;
  for (const source of sources) {
    if (source) {
      if (!headers) {
        headers = new Headers();
      }
      for (const [key, value] of from(source).entries()) {
        headers.append(key, value);
      }
    }
  }
  return headers;
}
