import { OAuth2 } from '@oauth2-cli/qui-cli';
import { Core } from '@qui-cli/core';
import { Log } from '@qui-cli/log';

await Core.run();
Log.info({ profile: await OAuth2.requestJSON('/api/v1/users/self/profile') });
