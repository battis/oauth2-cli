import * as client from 'openid-client';

interface TokenResponse extends client.TokenEndpointResponse {
  [key: string]: any;
}

export class Token implements TokenResponse {
  public readonly access_token: string;
  public readonly token_type: Lowercase<string>;
  public readonly timestamp = Date.now();
  public readonly refresh_token?: string;
  public readonly refresh_token_expires_in?: number;
  public readonly scope?: string;
  public readonly id_token?: string;
  public readonly expires_in?: number;

  private constructor(response: client.TokenEndpointResponse) {
    this.access_token = response.access_token;
    this.token_type = response.token_type;
    Object.assign(this, response);
  }

  public static fromResponse(response?: client.TokenEndpointResponse) {
    if (response) {
      return new Token(response);
    }
    return undefined;
  }

  public hasExpired() {
    return (
      this.expires_in === undefined ||
      Date.now() > this.timestamp + this.expires_in
    );
  }
}
