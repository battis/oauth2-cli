import { JsonObject, JsonValue } from 'openid-client';

export type ish = FormData | Record<string, string>;

export function toFormData(body: ish): FormData {
  if (body instanceof FormData) {
    return body;
  } else if (
    typeof body === 'string' ||
    typeof body === 'number' ||
    typeof body === 'boolean' ||
    Array.isArray(body)
  ) {
    throw new Error('Body cannot be converted to FormData');
  } else {
    const formData = new FormData();
    for (const name in body) {
      formData.append(name, body[name]);
    }
    return formData;
  }
}

export function toJSON(body: ish): JsonValue {
  if (body instanceof FormData) {
    return Object.fromEntries(body.entries()) as JsonObject;
  }
  return body;
}
