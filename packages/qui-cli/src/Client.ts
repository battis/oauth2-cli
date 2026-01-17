import { JSONValue } from '@battis/typescript-tricks';
import { Log } from '@qui-cli/log';
import * as OAuth2CLI from 'oauth2-cli';
import { DPoPOptions, FetchBody } from 'openid-client';

export class Client extends OAuth2CLI.Client {
  public async request(
    url: URL | string,
    method?: string,
    body?: FetchBody,
    headers?: Headers,
    dPoPOptions?: DPoPOptions
  ): Promise<Response> {
    Log.debug({ request: { method, url, headers, body, dPoPOptions } });
    const response = await super.request(
      url,
      method,
      body,
      headers,
      dPoPOptions
    );
    Log.debug({ response });
    return response;
  }

  public async requestJSON<T extends JSONValue = JSONValue>(
    url: URL | string,
    method?: string,
    body?: FetchBody,
    headers?: Headers,
    dPoPOptions?: DPoPOptions
  ): Promise<T> {
    const json = await super.requestJSON<T>(
      url,
      method,
      body,
      headers,
      dPoPOptions
    );
    Log.debug({ json });
    return json;
  }
}
