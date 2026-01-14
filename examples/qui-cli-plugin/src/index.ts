import { OAuth2 } from '@oauth2-cli/qui-cli';
import { Core } from '@qui-cli/core';
import { Env } from '@qui-cli/env-1password';
import { Log } from '@qui-cli/log';
import { Root } from '@qui-cli/root';
import path from 'node:path';

Root.configure({ root: path.dirname(import.meta.dirname) });
await Core.run();
Log.info({
  self: await OAuth2.requestJSON(
    new URL(
      '/api/v1/users/self',
      await Env.get({ key: 'AUTHORIZATION_ENDPOINT' })
    )
  )
});
