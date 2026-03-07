import { JSONPrimitive } from '@battis/typescript-tricks';
import { isJSONEntries, isJSONRecord } from './is.js';
import * as String from './String.js';

export type ish =
  | Headers
  | HeadersInit
  | Record<string, JSONPrimitive | undefined>
  | [string, JSONPrimitive | undefined][];

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
      headers.map(([key, value]) => [key, String.from(value)])
    );
  }
  return new Headers(headers);
}

export function merge(a?: ish, b?: ish): Headers | undefined {
  if (a && !b) {
    return from(a);
  } else if (!a && b) {
    return from(b);
  } else if (a && b) {
    const headers = from(a);
    from(b).forEach((value, key) => headers.set(key, value));
    return headers;
  }
  return undefined;
}
