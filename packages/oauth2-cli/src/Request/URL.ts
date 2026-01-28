import { URLString } from '@battis/descriptive-types';

export type ish = URL | URLString;

export function from(url: ish): URL {
  if (url instanceof URL) {
    return url;
  }
  return new URL(url);
}

export function toString(url: ish): URLString {
  if (typeof url === 'string') {
    return url;
  }
  return url.toString();
}
