export type ish =
  | Headers
  | NonNullable<RequestInit['headers']>
  | Record<string, string>
  | [string, string][];

export function from(headers?: ish): Headers {
  if (headers instanceof Headers) {
    return headers;
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
