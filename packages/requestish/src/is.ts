import {
  isEntries,
  isRecord,
  isString,
  JSONPrimitive
} from '@battis/typescript-tricks';

function isJSONPrimitiveOrUndefined(
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

export function isJSONRecord(
  obj: unknown
): obj is Record<string, JSONPrimitive | undefined> {
  return isRecord<string, JSONPrimitive | undefined>(
    obj,
    isString,
    isJSONPrimitiveOrUndefined
  );
}

export function isJSONEntries(
  obj: unknown
): obj is [string, JSONPrimitive | undefined][] {
  return isEntries<string, JSONPrimitive | undefined>(
    obj,
    isString,
    isJSONPrimitiveOrUndefined
  );
}
