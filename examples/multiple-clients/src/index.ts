import { Canvas } from '@oauth2-cli/canvas';
import { SkyAPI } from '@oauth2-cli/sky-api';
import { Core } from '@qui-cli/core';
import { Log } from '@qui-cli/log';
import { Root } from '@qui-cli/root';
import path from 'node:path';

Root.configure({ root: path.dirname(import.meta.dirname) });
await Core.run();

Log.info(
  (await Canvas.v1.Users.Profile.get({ pathParams: { user_id: 'self' } })) ||
    'no Canvas response'
);
Log.info(
  ((await SkyAPI.fetchJSON(
    'https://api.sky.blackbaud.com/school/v1/users/me'
  )) as object) || 'no SKY API response'
);
