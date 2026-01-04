import { Colors } from '@qui-cli/colors';
import { Core, Positionals } from '@qui-cli/core';
import { Log } from '@qui-cli/log';
import * as OAuth2CLI from 'oauth2-cli';
import { splitOptList } from './splitOptList.js';

Positionals.require({ tokenPath: {} });

const {
  values: {
    issuer,
    clientId: client_id,
    clientSecret: client_secret,
    redirectUri: redirect_uri,
    authorizationEndpoint: authorization_endpoint,
    tokenEndpoint: token_endpoint,
    ...values
  }
} = await Core.init({
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
      description: `Format: ${Colors.quotedValue('"Header:value"')}`,
      hint: 'name:value'
    },
    parameter: {
      description: `Format: ${Colors.quotedValue('"parameter=value"')}`,
      hint: 'name=value'
    }
  }
});
const tokenPath = Positionals.get('tokenPath');

if (!client_id || !client_secret || !redirect_uri || !authorization_endpoint) {
  throw new Error('Missing required argument');
}

const client = new OAuth2CLI.Client({
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
Log.info({ token: await client.getToken() });
