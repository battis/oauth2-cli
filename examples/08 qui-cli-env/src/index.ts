import { OAuth2, Token } from '@oauth2-cli/qui-cli';
import { Core } from '@qui-cli/core';
import { Log } from '@qui-cli/log';
import { Root } from '@qui-cli/root';

// only necessary because we're in a monorepo and qui-cli _really_ wants to be at the root of it!
Root.configure({ root: process.cwd() });

OAuth2.configure({
  storage: new Token.EnvironmentStorage('ACCESS_TOKEN')
});
await Core.run();
Log.info({ profile: await OAuth2.requestJSON('/api/v1/users/self/profile') });
