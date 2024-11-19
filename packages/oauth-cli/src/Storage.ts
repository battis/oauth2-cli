import * as client from 'openid-client';

export type StorableToken = client.TokenEndpointResponse &
  Partial<client.TokenEndpointResponseHelpers> & {
    timestamp: number;
  };

export interface Storage {
  load(): Promise<StorableToken | undefined>;
  save(tokens: StorableToken): Promise<void>;
}
