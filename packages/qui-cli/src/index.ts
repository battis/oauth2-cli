import { register } from '@qui-cli/plugin';
import { OAuth2Plugin } from './OAuth2Plugin.js';

export const OAuth2 = new OAuth2Plugin();
export { Credentials, Errors, WebServer } from 'oauth2-cli';
export * from './Client.js';
export * from './OAuth2Plugin.js';
export * as Token from './Token/index.js';

await register(OAuth2);
