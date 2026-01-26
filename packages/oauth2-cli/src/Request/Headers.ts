export type ish = Headers | Record<string, string>;

export function toHeaders(headers: ish): Headers {
  if (headers instanceof Headers) {
    return headers;
  }
  return new Headers(headers);
}

export function mergeHeaders(a?: ish, b?: ish): Headers | undefined {
  if (a && !b) {
    return toHeaders(a);
  } else if (!a && b) {
    return toHeaders(b);
  } else if (a && b) {
    const headers = toHeaders(a);
    toHeaders(b).forEach((value, key) => headers.set(key, value));
    return headers;
  }
  return undefined;
}
