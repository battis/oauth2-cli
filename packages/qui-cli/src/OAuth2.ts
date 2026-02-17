import { OAuth2Plugin } from './OAuth2Plugin.js';

export { ClientOptions, Credentials, Request, WebServer } from 'oauth2-cli';
export * from './Client.js';
export * from './OAuth2Plugin.js';
export * as Token from './Token/index.js';

export const OAuth2 = new OAuth2Plugin();
