import { JSONValue } from '@battis/typescript-tricks';
import { Client } from './Client.js';

type Options<T extends JSONValue = JSONValue> = {
  page: T[];
  response: Response;
  client: Client;
};

export abstract class PaginatedCollection<T extends JSONValue>
  implements AsyncIterable<T>, AsyncIterableIterator<T>
{
  protected currentResponse: Response;
  protected currentElt = 0;
  protected currentPage: T[];

  protected client: Client;

  public constructor({ page, response, client }: Options<T>) {
    this.currentResponse = response;
    this.currentPage = page;
    this.client = client;
  }

  public [Symbol.asyncIterator]() {
    return this;
  }

  protected abstract nextPage(): Promise<T[] | undefined>;

  public async next(): Promise<IteratorResult<T>> {
    return new Promise((resolve) => {
      const value = this.currentPage[this.currentElt++];
      if (this.currentElt === this.currentPage.length) {
        this.nextPage().then((page) => {
          if (page) {
            this.currentPage = page;
            this.currentElt = 0;
            resolve({ value, done: this.currentPage.length === 0 });
          } else {
            resolve({ value, done: true });
          }
        });
      } else {
        resolve({ value, done: false });
      }
    });
  }
}
