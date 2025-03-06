import { Mutex } from 'async-mutex';
import * as OpenIDClient from 'openid-client';

export type Options = {
  client_id: string;
  client_secret: string;
  redirect_uri: string;
  issuer?: string;
  authorization_endpoint: string;
  token_endpoint?: string;
};

let configuration: OpenIDClient.Configuration | undefined = undefined;

const configMutex = new Mutex();

export async function acquire({
  client_id,
  client_secret,
  redirect_uri,
  issuer,
  authorization_endpoint,
  token_endpoint
}: Options): Promise<OpenIDClient.Configuration> {
  return await configMutex.runExclusive(async () => {
    if (configuration) {
      return configuration;
    } else {
      if (issuer) {
        configuration = await OpenIDClient.discovery(
          new URL(issuer),
          client_id,
          client_secret
        );
      } else {
        configuration = new OpenIDClient.Configuration(
          {
            issuer: `https://${new URL(authorization_endpoint).hostname}`, // TODO is there a better way to fake this?
            authorization_endpoint,
            token_endpoint: token_endpoint || authorization_endpoint
          },
          client_id,
          { client_secret, redirect_uri }
        );
      }
      return configuration;
    }
  });
}
