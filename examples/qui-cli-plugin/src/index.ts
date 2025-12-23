import { OAuth2 } from '@oauth2-cli/qui-cli-plugin';
import CLI from '@qui-cli/qui-cli';
import path from 'node:path';

CLI.root.configure({ root: path.dirname(import.meta.dirname) });
await CLI.run();
CLI.log.info({
  self: await OAuth2.requestJSON(
    new URL('/api/v1/users/self', process.env.AUTHORIZATION_ENDPOINT)
  )
});
