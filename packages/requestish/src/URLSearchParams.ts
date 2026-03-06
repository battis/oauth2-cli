import { isRecord, JSONPrimitive } from '@battis/typescript-tricks';
import { ish as URLish } from './URL.js';
import { isJSONPrimitive, isString } from './isRecord.js';

export type ish =
  | URLSearchParams
  | ConstructorParameters<typeof URLSearchParams>[0]
  | Record<string, JSONPrimitive>;

export function from(search?: ish): URLSearchParams {
  if (search instanceof URLSearchParams) {
    return search;
  } else if (
    isRecord<string, JSONPrimitive>(search, isString, isJSONPrimitive)
  ) {
    return new URLSearchParams(
      Object.fromEntries(
        Object.entries(search || {})
          .filter(([_, value]) => value !== undefined)
          .map(([key, value]) => [key, value?.toString() || ''])
      )
    );
  }
  return new URLSearchParams(search);
}

export function toString(search: ish): string {
  const query = from(search).toString();
  if (query.length) {
    return `?${query}`;
  }
  return '';
}

export function merge(a?: ish, b?: ish): URLSearchParams | undefined {
  if (a && !b) {
    return from(a);
  } else if (!a && b) {
    return from(b);
  } else if (a && b) {
    const search = from(a);
    from(b).forEach((value, key) => search.set(key, value));
    return search;
  }
  return undefined;
}

export function appendTo(url: URLish, search: ish): URLish {
  if (url instanceof URL) {
    const result = new URL(url);
    result.search = toString(search);
    return result;
  } else {
    return url.replace(/(.+)(\?.*)?$/, `$1${toString(search)}`);
  }
}
