import { OAuth2 } from '@oauth2-cli/qui-cli-plugin';
import CLI from '@qui-cli/qui-cli';
import path from 'node:path';

await CLI.configure({
  root: { root: path.dirname(import.meta.dirname) },
  env: { path: path.join(import.meta.dirname, '../.env') }
});
await CLI.init();
console.log(
  await OAuth2.requestJSON(
    new URL('/api/v1/users/self', process.env.AUTHORIZATION_ENDPOINT)
  )
);
