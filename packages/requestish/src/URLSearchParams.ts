import { isRecord, JSONPrimitive } from '@battis/typescript-tricks';
import { ish as URLish } from './URL.js';
import { isJSONPrimitive, isString } from './isRecord.js';

export type ish =
  | URLSearchParams
  | ConstructorParameters<typeof URLSearchParams>[0]
  | Record<string, JSONPrimitive | undefined>
  | [string, JSONPrimitive | undefined][];

/**
 * Construct an actual URLSearchParams object from a URLSearchParams.ish
 *
 * `undefined` values are removed from records:
 *
 * ```ts
 * from({ a: null, b: undefined, c: '' }); // a=null&c=
 * ```
 *
 * Entry arrays allow undefined values and multiple values per key:
 *
 * ```ts
 * from([
 *   ['a', 'A'],
 *   ['a', 'B'],
 *   ['c', undefined],
 *   ['d', null]
 * ]); // a=A&a=B&c=&d=null
 * ```
 */
export function from(search?: ish): URLSearchParams {
  if (search instanceof URLSearchParams) {
    return search;
  } else if (
    search &&
    isRecord<string, JSONPrimitive | undefined>(
      search,
      isString,
      isJSONPrimitive
    )
  ) {
    return new URLSearchParams(
      Object.fromEntries(
        Object.entries(search)
          .filter(([__dirname, value]) => value !== undefined)
          .map(([key, value]) => [
            key,
            typeof value === 'string'
              ? value
              : value?.toString() || JSON.stringify(value)
          ])
      )
    );
  } else if (Array.isArray(search)) {
    return new URLSearchParams(
      search.map(([key, value]) => [
        key,
        typeof value === 'string'
          ? value
          : value === null
            ? 'null'
            : value === undefined
              ? ''
              : value.toString()
      ])
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

/**
 * If the `URLSearchParams.ish` is defined, append it to the `URL.ish` replacing
 * any existing query string, otherwise return the `URL.ish` unmodified.
 */
export function appendTo(url: URLish, search: ish): URLish {
  if (url instanceof URL) {
    const result = new URL(url);
    result.search = toString(search);
    return result;
  } else {
    return url.replace(/(.+)(\?.*)?$/, `$1${toString(search)}`);
  }
}
