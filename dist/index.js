export const pattern = /^\/(https?)\/((localhost)(:(\d+))?)(\/.*)$/;
export function parse(url) {
    const u = new URL(url);
    let port;
    const [, protocol, , hostname, , p, path] = u.pathname.match(pattern) || [];
    if (p) {
        port = parseInt(p);
    }
    else if (protocol) {
        port = protocol === 'https' ? 443 : 80;
    }
    else if (u.port !== '') {
        port = parseInt(p);
    }
    else {
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
export function path(url) {
    const { url: u, path } = parse(url);
    return path || u.pathname;
}
export function port(url) {
    return parse(url).port;
}
