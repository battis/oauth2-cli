import { ish as URLish } from './URL.js';

export type ish = URLSearchParams | Record<string, string>;

export function toURLSearchParams(search: ish): URLSearchParams {
  if (search instanceof URLSearchParams) {
    return search;
  }
  return new URLSearchParams(search);
}

export function toString(search: ish): string {
  const query = toURLSearchParams(search).toString();
  if (query.length) {
    return `?${query}`;
  }
  return '';
}

export function mergeSearch(a?: ish, b?: ish): URLSearchParams | undefined {
  if (a && !b) {
    return toURLSearchParams(a);
  } else if (!a && b) {
    return toURLSearchParams(b);
  } else if (a && b) {
    const search = toURLSearchParams(a);
    toURLSearchParams(b).forEach((value, key) => search.set(key, value));
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
