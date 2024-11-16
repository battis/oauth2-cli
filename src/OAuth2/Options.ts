type MimeType = 'application/x-www-form-urlencoded' | 'application/json';

export type Options = {
  authorizationUrl: string;
  tokenUrl?: string;
  requestFormat: MimeType;
  headers?: Record<string, string>;
  tokenPath?: string;
};
