import { PathString, URLString } from '@battis/descriptive-types';
import { Colors } from '@qui-cli/colors';
import '@qui-cli/env-1password';
import * as Plugin from '@qui-cli/plugin';
import { Root } from '@qui-cli/root';
import path from 'node:path';
import * as OAuth2 from 'oauth2-cli';
import * as OpenIDClient from 'openid-client';

export type Configuration = Plugin.Configuration & {
  client_id?: string;
  client_secret?: string;
  redirect_uri?: URLString;
  authorization_endpoint?: URLString;
  token_endpoint?: URLString;
  store?: OAuth2.TokenStorage;
  token_path?: PathString;
};

export const name = '@oauth2-cli/qui-cli-plugin';

const config: Configuration = {};
let client: OAuth2.Client | undefined = undefined;

export function configure(proposal: Configuration = {}) {
  for (const key in proposal) {
    if (proposal[key] !== undefined) {
      config[key] = proposal[key];
    }
  }
  if (!config.store && config.token_path) {
    config.store = new OAuth2.FileStorage(
      path.resolve(Root.path(), config.token_path)
    );
  }
}

export function options(): Plugin.Options {
  return {
    opt: {
      clientId: {
        description: `OAuth 2.0 client ID (defaults to environment variable ${Colors.value('CLIENT_ID')})`,
        secret: true,
        default: config.client_id
      },
      clientSecret: {
        description: `OAuth 2.0 client secret (defaults to environment variable ${Colors.value('CLIENT_SECRET')}`,
        secret: true,
        default: config.client_secret
      },
      redirectUri: {
        description: `OAuth 2.0 redirect URI (must be to host ${Colors.url('localhost')}, e.g. ${Colors.quotedValue(`"http://localhost:3000/oauth2/redirect"`)}, defaults to environment variables ${Colors.value('REDIRECT_URI')})`,
        default: config.redirect_uri
      },
      authorizationEndpoint: {
        description: `OAuth 2.0 authorization endpoint (defaults to environment variable ${Colors.value('AUTHORIZATION_ENDPOINT')}`,
        default: config.authorization_endpoint
      },
      tokenEndpoint: {
        description: `OAuth 2.0 token endpoint (will fall back to authorization endpoint if not provided, defaults to environment variable ${Colors.value('TOKEN_ENDPOINT')}`,
        default: config.token_endpoint
      },
      tokenPath: {
        description: `Path to token storage JSON file (defaults to environent variable ${Colors.value('TOKEN_PATH')}`,
        default: config.token_path
      }
    }
  };
}

export function init(args: Plugin.ExpectedArguments<typeof options>) {
  const {
    values: {
      clientId: client_id = process.env.CLIENT_ID,
      clientSecret: client_secret = process.env.CLIENT_SECRET,
      redirectUri: redirect_uri = process.env.REDIRECT_URI,
      authorizationEndpoint: authorization_endpoint = process.env
        .AUTHORIZATION_ENDPOINT,
      tokenEndpoint: token_endpoint = process.env.TOKEN_ENDPOINT,
      tokenPath: token_path = process.env.TOKEN_PATH
    }
  } = args;
  configure({
    client_id,
    client_secret,
    redirect_uri,
    authorization_endpoint,
    token_endpoint,
    token_path
  });
}

function getClient() {
  if (!client) {
    const {
      client_id,
      client_secret,
      redirect_uri,
      authorization_endpoint,
      token_endpoint,
      store
    } = config;
    if (!client_id) {
      throw new Error('OAuth 2.0 client ID not defined');
    }
    if (!client_secret) {
      throw new Error('OAuth 2.0 client secret not defined');
    }
    if (!redirect_uri) {
      throw new Error('OAuth 2.0 redirect URI not defined');
    }
    if (!authorization_endpoint) {
      throw new Error('OAuth 2.0 authorization endpoint not defined');
    }
    client = new OAuth2.Client({
      client_id,
      client_secret,
      redirect_uri,
      authorization_endpoint,
      token_endpoint,
      store
    });
  }
  return client;
}

export async function getToken() {
  return await getClient().getToken();
}

export async function request(
  url: URL | string,
  method: string = 'GET',
  body?: OpenIDClient.FetchBody,
  headers?: Record<string, string>,
  options?: OpenIDClient.DPoPOptions
) {
  return await getClient().request(url, method, body, headers, options);
}

export async function requestJSON(
  url: URL | string,
  method: string = 'GET',
  body?: OpenIDClient.FetchBody,
  headers?: Record<string, string>,
  options?: OpenIDClient.DPoPOptions
) {
  return await getClient().requestJSON(url, method, body, headers, options);
}
