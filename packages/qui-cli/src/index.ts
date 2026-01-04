import { register } from '@qui-cli/plugin';
import { OAuth2 as Plugin } from './OAuth2.js';

export * from './EnvironmentStorage.js';
export const OAuth2 = new Plugin();

await register(OAuth2);
