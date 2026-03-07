import { JSONPrimitive } from '@battis/typescript-tricks';

export function from(value?: JSONPrimitive) {
  return typeof value === 'string'
    ? value
    : value === null
      ? 'null'
      : value === undefined
        ? ''
        : value.toString();
}
