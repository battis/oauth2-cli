import { register } from '@qui-cli/plugin';
import { OAuth2 as plugin } from './OAuth2.js';

export * from './OAuth2.js';

await register(plugin);

