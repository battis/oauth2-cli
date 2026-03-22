import { JSONValue } from '@battis/typescript-tricks';
import { Client } from 'oauth2-cli';
import { GHPaginatedCollection } from './GHPaginatedCollection.js';

export class GHClient extends Client {
  protected checkForPagination<T extends JSONValue = JSONValue>(
    response: Response,
    data: JSONValue
  ): GHPaginatedCollection<T> | undefined {
    if (Array.isArray(data) && response.headers.has('link')) {
      return new GHPaginatedCollection<T>({
        page: data as T[],
        response,
        client: this
      });
    }
    return undefined;
  }
}
