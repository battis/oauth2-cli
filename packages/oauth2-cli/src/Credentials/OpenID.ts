import * as Req from '../Request/index.js';

export type OpenID = {
  client_id: string;
  client_secret: string;
  redirect_uri: Req.URL.ish;
  issuer: Req.URL.ish;
};
