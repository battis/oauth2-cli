import { JSONPrimitive } from '@battis/typescript-tricks';

export function isString(obj: unknown): obj is string {
  return typeof obj === 'string';
}

export function isJSONPrimitive(
  obj: unknown
): obj is JSONPrimitive | undefined {
  return (
    obj === null ||
    obj === undefined ||
    typeof obj === 'string' ||
    typeof obj === 'number' ||
    typeof obj === 'boolean'
  );
}
