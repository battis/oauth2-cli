import { register } from '@qui-cli/plugin';
import * as OAuth2 from './OAuth2CLI.js';

export * from './EnvironmentStorage.js';
export { OAuth2 };

await register(OAuth2);
