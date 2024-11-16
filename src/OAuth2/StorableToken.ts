export type TokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  refresh_token_expires_in: number;
  scope?: string;
};

export type StorableToken = TokenResponse & {
  timestamp: number;
};

export type ServerError = {
  error: string;
  [key: string]: any;
};

export function isServerError(u: unknown): u is ServerError {
  return typeof u === 'object' && u !== null && 'error' in u;
}
