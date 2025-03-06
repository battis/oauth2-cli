import cli from '@battis/qui-cli';
import { OAuth2 } from '@oauth2-cli/qui-cli-plugin';
import path from 'node:path';

await cli.configure({
  root: { root: path.dirname(import.meta.dirname) },
  env: { path: path.join(import.meta.dirname, '../.env') }
});
await cli.init();
console.log(
  await OAuth2.requestJSON(
    new URL('/api/v1/users/self', process.env.AUTHORIZATION_ENDPOINT)
  )
);
