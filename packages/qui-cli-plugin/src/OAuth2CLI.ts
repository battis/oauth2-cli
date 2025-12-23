import { PathString, URLString } from '@battis/descriptive-types';
import { Colors } from '@qui-cli/colors';
import '@qui-cli/env-1password';
import * as Plugin from '@qui-cli/plugin';
import { Root } from '@qui-cli/root';
import path from 'node:path';
import * as OAuth2 from 'oauth2-cli';
import * as OpenIDClient from 'openid-client';

type EnvironmentVars = {
  client_id: string;
  client_secret: string;
  redirect_uri: string;
  authorization_endpoint: string;
  token_endpoint: string;
  token_path: string;
  access_token: string;
};

type OptionSuppression = {
  clientId?: boolean;
  clientSecret?: boolean;
  redirectUri?: boolean;
  authorizationEndpoint?: boolean;
  tokenEndpoint?: boolean;
  tokenPath?: boolean;
};

type Usage = {
  heading: string;
  text?: string[];
};

export type Configuration = Plugin.Configuration & {
  client_id?: string;
  client_secret?: string;
  redirect_uri?: URLString;
  authorization_endpoint?: URLString;
  token_endpoint?: URLString;

  store?: OAuth2.TokenStorage;
  token_path?: PathString;

  env: EnvironmentVars;
  man: Usage;
  suppress?: OptionSuppression;
};

export const name = '@oauth2-cli/qui-cli-plugin';

const config: Configuration = {
  redirect_uri: 'http://localhost:3000/redirect',

  env: {
    client_id: 'CLIENT_ID',
    client_secret: 'CLIENT_SECRET',
    redirect_uri: 'REDIRECT_URI',
    authorization_endpoint: 'AUTHORIZATION_ENDPOINT',
    token_endpoint: 'TOKEN_ENDPOINT',
    token_path: 'TOKEN_PATH',
    access_token: 'ACCESS_TOKEN'
  },
  man: {
    heading: 'OAuth 2.0 client options'
  }
};
let client: OAuth2.Client | undefined = undefined;

export function configure(proposal: Partial<Configuration> = {}) {
  for (const key in proposal) {
    if (proposal[key] !== undefined) {
      config[key] = proposal[key];
    }
  }
  if (!config.store) {
    if (config.token_path) {
      config.store = new OAuth2.FileStorage(
        path.resolve(Root.path(), config.token_path)
      );
    }
  }
}

export function options(): Plugin.Options {
  return {
    man: [
      { level: 1, text: config.man.heading },
      ...(config.man.text || []).map((t) => ({ text: t }))
    ],
    opt: {
      ...(config.suppress?.clientId
        ? {}
        : {
            clientId: {
              description: `OAuth 2.0 client ID (defaults to environment variable ${Colors.value(config.env.client_id)})`,
              secret: true,
              default: config.client_id
            }
          }),
      ...(config.suppress?.clientSecret
        ? {}
        : {
            clientSecret: {
              description: `OAuth 2.0 client secret (defaults to environment variable ${Colors.value(config.env.client_secret)}`,
              secret: true,
              default: config.client_secret
            }
          }),
      ...(config.suppress?.redirectUri
        ? {}
        : {
            redirectUri: {
              description: `OAuth 2.0 redirect URI (must be to host ${Colors.url('localhost')}, defaults to environment variables ${Colors.value(config.env.redirect_uri)})`,
              hint: Colors.quotedValue(`"${config.redirect_uri}"`),
              default: config.redirect_uri
            }
          }),
      ...(config.suppress?.authorizationEndpoint
        ? {}
        : {
            authorizationEndpoint: {
              description: `OAuth 2.0 authorization endpoint (defaults to environment variable ${Colors.value(config.env.authorization_endpoint)}`,
              default: config.authorization_endpoint
            }
          }),
      ...(config.suppress?.tokenEndpoint
        ? {}
        : {
            tokenEndpoint: {
              description: `OAuth 2.0 token endpoint (will fall back to authorization endpoint if not provided, defaults to environment variable ${Colors.value(config.env.token_endpoint)}`,
              default: config.token_endpoint
            }
          }),
      ...(config.suppress?.tokenPath
        ? {}
        : {
            tokenPath: {
              description: `Path to token storage JSON file (defaults to environent variable ${Colors.value(config.env.token_path)}`,
              default: config.token_path
            }
          })
    }
  };
}

export function init(args: Plugin.ExpectedArguments<typeof options>) {
  const {
    values: {
      clientId: client_id = process.env[config.env.client_id],
      clientSecret: client_secret = process.env[config.env.client_secret],
      redirectUri: redirect_uri = process.env[config.env.redirect_uri],
      authorizationEndpoint: authorization_endpoint = process.env[
        config.env.authorization_endpoint
      ],
      tokenEndpoint: token_endpoint = process.env[config.env.token_endpoint],
      tokenPath: token_path = process.env[config.env.token_path]
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
