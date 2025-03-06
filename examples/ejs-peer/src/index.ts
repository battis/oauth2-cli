import cli from '@battis/qui-cli';
import * as oauth2 from 'oauth2-cli';
import { splitOptList } from './splitOptList.js';

await cli.configure({ core: { requirePositionals: 1 } });

const {
  positionals: [tokenPath],
  values: {
    issuer,
    clientId: client_id,
    clientSecret: client_secret,
    redirectUri: redirect_uri,
    authorizationEndpoint: authorization_endpoint,
    tokenEndpoint: token_endpoint,
    ...values
  }
} = await cli.init({
  opt: {
    issuer: {},
    clientId: { description: 'Required' },
    clientSecret: { description: 'Required' },
    redirectUri: { description: 'Required' },
    authorizationEndpoint: { description: 'Required' },
    tokenEndpoint: {}
  },
  optList: {
    header: {
      description: `Format: ${cli.colors.quotedValue('"Header:value"')}`
    },
    parameter: {
      description: `Format: ${cli.colors.quotedValue('"parameter=value"')}`
    }
  }
});

if (!client_id || !client_secret || !redirect_uri || !authorization_endpoint) {
  throw new Error('Missing required argument');
}

const tokenManager = new oauth2.TokenManager({
  issuer,
  client_id,
  client_secret,
  redirect_uri,
  authorization_endpoint,
  token_endpoint,
  headers: splitOptList(':', values.header),
  parameters: splitOptList('=', values.parameter),
  store: tokenPath
});
console.log(await tokenManager.getToken());
