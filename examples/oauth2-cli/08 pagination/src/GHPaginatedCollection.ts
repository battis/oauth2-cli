import { JSONValue } from '@battis/typescript-tricks';
import { PaginatedCollection } from 'oauth2-cli';

export class GHPaginatedCollection<
  T extends JSONValue
> extends PaginatedCollection<T> {
  protected async nextPage(): Promise<T[] | undefined> {
    const [_, url] =
      this.currentResponse.headers
        .get('link')
        ?.match(/<([^>]+)>; rel="next"/) || [];
    if (url) {
      this.currentResponse = await this.client.fetchRaw(url);
      return await this.client.processResponse<T[]>(
        this.currentResponse,
        false
      );
    }
    return undefined;
  }
}
