import { PathString, URLString } from '@battis/descriptive-types';

export const pattern = /^\/(https?)\/((localhost)(:(\d+))?)(\/.*)$/;

export function parse(url: URL | URLString) {
  const u = new URL(url);
  const [
    ,
    protocol = undefined,
    ,
    hostname = undefined,
    ,
    port = undefined,
    path = undefined
  ] = u.pathname.match(pattern) || [];
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
  const { url: u, protocol, port } = parse(url);
  if (port === undefined) {
    if (protocol === undefined) {
      if (u.port === '') {
        return u.protocol === 'https:' ? 443 : 80;
      } else {
        return parseInt(u.port);
      }
    } else {
      return protocol === 'https' ? 443 : 80;
    }
  }
  return parseInt(port);
}
