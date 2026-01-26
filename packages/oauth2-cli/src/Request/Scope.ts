export type ish = string | string[];

export function toString(scope: ish, separator: ' '): string {
  if (typeof scope === 'string') {
    return scope;
  }
  return scope.join(separator);
}
