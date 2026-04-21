export type ish = string | string[];

export function toString(scope: ish, separator = ' '): string {
  if (typeof scope === 'string') {
    return scope;
  }
  return scope.join(separator);
}

export function toArray(scope: ish, separator = ' '): string[] {
  if (Array.isArray(scope)) {
    return scope;
  }
  return scope.split(separator);
}
