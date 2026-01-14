import { register } from '@qui-cli/plugin';
import * as OAuth2 from './Module.js';

export * from './EnvironmentStorage.js';
export { OAuth2 };

await register(OAuth2);
