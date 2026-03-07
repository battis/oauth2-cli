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

/**
 * Merge a collection of URLSearchParams.ish into a single URLSearchParams
 * object
 *
 * `URLSearchParams.ish` are instantiated using `from()` before merging`:
 *
 * ```ts
 * merge({ a: 1, b: undefined, c: 'foo' }); // a=1&c=foo
 * merge([
 *   ['a', 1],
 *   ['b', undefined],
 *   ['c', 'foo']
 * ]); // a=1&b=&c=foo
 * ```
 *
 * Duplicate key values overwrite each other, even in a single
 * URLSearchParams.ish:
 *
 * ```ts
 * merge([
 *   ['a', 'A'],
 *   ['a', 'B']
 * ]); // a=B
 * ```
 *
 * `URLSearchParams.ish` are merged in order, overwriting previous key values:
 *
 * ```ts
 * merge({ a: 1, b: 2 }, { b: 3, c: 4 }, { c: 5, d: 6 }); // a=1&b=3&c=5&d=6
 * merge({ a: 1 }, { a: undefined, b: 2, c: 3 }, { b: undefined, c: 4 }); // a=1&b=2&c=4
 * ```
 */
export function merge(...sources: ish[]): URLSearchParams | undefined {
  let search: URLSearchParams | undefined = undefined;
  for (const source of sources) {
    if (source) {
      if (!search) {
        search = new URLSearchParams();
      }
      for (const [key, value] of from(source).entries()) {
        search.set(key, value);
      }
    }
  }
  return search;
}

/**
 * Concatenate `URLSearchParams.ish` together in order without overwriting
 * previous key-value pairs
 *
 * `URLSearchParams.ish` are instantiated using `from()` before concatenation`:
 *
 * ```ts
 * concatenate({ a: 1, b: undefined, c: 'foo' }); // a=1&c=2
 * concatenate([
 *   ['a', 1],
 *   ['b', undefined],
 *   ['c', 'foo']
 * ]); // a=1&b=&c=foo
 * ```
 *
 * Repeated keys are append to the query:
 *
 * ```ts
 * concatenate({ a: 1, b: 2 }, { b: 3, c: 4 }, { c: 5, d: 6 }); // a=1&b=2&b=3&c=4&c=5&d=6
 * ```
 */
export function concatenate(...sources: ish[]): URLSearchParams | undefined {
  let search: URLSearchParams | undefined = undefined;
  for (const source of sources) {
    if (source) {
      if (!search) {
        search = new URLSearchParams();
      }
      for (const [key, value] of from(source).entries()) {
        search.append(key, value);
      }
    }
  }
  return search;
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
