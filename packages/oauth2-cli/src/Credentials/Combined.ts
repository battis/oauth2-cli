import { OAuth2 } from './OAuth2.js';
import { OpenID } from './OpenID.js';

export type Combined = (OAuth2 & Partial<OpenID>) | (Partial<OAuth2> & OpenID);
