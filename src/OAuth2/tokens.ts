export type TokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  environment_id: string;
  environment_name: string;
  legal_entity_id: string;
  legal_entity_name: string;
  user_id: string;
  email: string;
  family_name: string;
  given_name: string;
  refresh_token_expires_in: number;
  mode: string;
  scope: string;
};

export type StorableToken = TokenResponse & {
  timestamp: number;
};

export type TokenError = {
  error: string;
  [key: string]: any;
};

export function isTokenError(u: unknown): u is TokenError {
  return typeof u === 'object' && u !== null && 'error' in u;
}
