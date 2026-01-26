export class BadResponse extends Error {
  public constructor(response: Response) {
    super(`Response error ${response.status}: ${response.statusText}`, {
      cause: response
    });
  }
}
