export class MissingAccessToken extends Error {
  public constructor() {
    super('No access token available.');
  }
}
