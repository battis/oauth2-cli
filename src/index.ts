import { PathString, URLString } from '@battis/descriptive-types';

export const pattern = /^\/(https?)\/((localhost)(:(\d+))?)(\/.*)$/;

export function parse(url: URL | URLString) {
  const u = new URL(url);
  let port: number;
  const [, protocol, , hostname, , p, path] = u.pathname.match(pattern) || [];
  if (p) {
    port = parseInt(p);
  } else if (protocol) {
    port = protocol === 'https' ? 443 : 80;
  } else if (u.port !== '') {
    port = parseInt(p);
  } else {
    port = u.protocol === 'https' ? 443 : 80;
  }
  return {
    url: u,
    protocol,
    hostname,
    port,
    path
  };
}

export function path(url: URL | URLString): PathString {
  const { url: u, path } = parse(url);
  return path || u.pathname;
}

export function port(url: URL | URLString): number {
  return parse(url).port;
}
