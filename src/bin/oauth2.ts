import cli from '@battis/qui-cli';
import * as OAuth2 from '../OAuth2.js';
import { args, parse } from './options.js';

(async () => {
  const { values } = cli.init({
    args: args
  });

  const { credentials, options } = parse(values);

  console.log(await OAuth2.getToken(credentials, options));
})();
