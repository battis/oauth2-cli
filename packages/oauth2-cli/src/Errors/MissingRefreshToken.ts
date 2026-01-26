export class MissingRefreshToken extends Error {
  public constructor() {
    super('No refresh token available.');
  }
}
