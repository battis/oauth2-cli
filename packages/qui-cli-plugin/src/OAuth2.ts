import { PathString, URLString } from '@battis/descriptive-types';
import { Colors } from '@qui-cli/colors';
import '@qui-cli/env-1password';
import { Env } from '@qui-cli/env-1password';
import { Log } from '@qui-cli/log';
import * as Plugin from '@qui-cli/plugin';
import { Root } from '@qui-cli/root';
import path from 'node:path';
import * as OAuth2CLI from 'oauth2-cli';
import * as OpenIDClient from 'openid-client';
import { EnvironmentStorage } from './EnvironmentStorage.js';

export { Credentials } from 'oauth2-cli';

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
  headers?: Record<string, string>;
  authorization_endpoint?: URLString;
  token_endpoint?: URLString;

  store?: OAuth2CLI.TokenStorage;
  token_path?: PathString;

  env: EnvironmentVars;
  man: Usage;
  suppress?: OptionSuppression;
};

export type RequestURL = URL | string;
export type RequestMethod = string;
export type RequestBody = undefined | OpenIDClient.FetchBody;
export type RequestHeaders = Record<string, string>;
export type RequestOptions = undefined | OpenIDClient.DPoPOptions;

export class OAuth2 {
  [key: string]: unknown;

  private static names: string[] = [];
  private static ports: Record<string, string> = {};

  public constructor(public readonly name = '@oauth2-cli/qui-cli-plugin') {
    if (OAuth2.names.includes(name)) {
      throw new Error(
        `A @qui-cli/plugin named ${Colors.value(name)} has already been instantiated.`
      );
    }
  }

  private config: Configuration = {
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
    },
    suppress: {
      tokenPath: true
    }
  };
  private client: OAuth2CLI.Client | undefined = undefined;

  public configure(
    proposal: Partial<Omit<Configuration, 'env' | 'suppress'>> & {
      env?: Partial<EnvironmentVars>;
      suppress?: Partial<OptionSuppression>;
    } = {}
  ) {
    for (const key in proposal) {
      if (proposal[key] !== undefined) {
        this.config[key] = proposal[key];
      }
    }
    if (!this.config.store) {
      if (this.config.token_path) {
        this.config.store = new OAuth2CLI.FileStorage(
          path.resolve(Root.path(), this.config.token_path)
        );
      } else {
        this.config.store = new EnvironmentStorage(
          this.config.env.access_token
        );
      }
    }

    if (this.config.redirect_uri) {
      const url = new URL(this.config.redirect_uri);
      if (url.hostname !== 'localhost') {
        Log.warning(
          `The ${Colors.varName('redirect_uri')} value ${Colors.url(
            this.config.redirect_uri
          )} may not work: it ${Colors.keyword('must')} point to ${Colors.url(
            'localhost'
          )}`
        );
      }
      if (url.protocol !== 'http:') {
        Log.warning(
          `The ${Colors.url(
            url.protocol
          )} protocol may not work without additional configuration. The server listening for the redirect will be running at ${Colors.url(
            `http://localhost:${url.port}`
          )}`
        );
      }
      if (OAuth2.ports[url.port] && OAuth2.ports[url.port] !== this.name) {
        Log.warning(
          `The port ${Colors.value(
            url.port
          )} has already been registered to another instance of this plugin named ${Colors.value(
            OAuth2.ports[url.port]
          )}. This will likely cause a failure if both instances of the plugin are listening for redirects at relatively proximate moments in time.`
        );
      }
    }
  }

  public options(): Plugin.Options {
    return {
      man: [
        { level: 1, text: this.config.man.heading },
        ...(this.config.man.text || []).map((t) => ({ text: t }))
      ],
      opt: {
        ...(this.config.suppress?.clientId
          ? {}
          : {
              clientId: {
                description: `OAuth 2.0 client ID (defaults to environment variable ${Colors.value(this.config.env.client_id)})`,
                secret: true,
                default: this.config.client_id
              }
            }),
        ...(this.config.suppress?.clientSecret
          ? {}
          : {
              clientSecret: {
                description: `OAuth 2.0 client secret (defaults to environment variable ${Colors.value(this.config.env.client_secret)}`,
                secret: true,
                default: this.config.client_secret
              }
            }),
        ...(this.config.suppress?.redirectUri
          ? {}
          : {
              redirectUri: {
                description: `OAuth 2.0 redirect URI (must be to host ${Colors.url('localhost')}, defaults to environment variables ${Colors.value(this.config.env.redirect_uri)})`,
                hint: Colors.quotedValue(
                  `"http://localhost:XXXX/path/to/redirect"`
                ),
                default: this.config.redirect_uri
              }
            }),
        ...(this.config.suppress?.authorizationEndpoint
          ? {}
          : {
              authorizationEndpoint: {
                description: `OAuth 2.0 authorization endpoint (defaults to environment variable ${Colors.value(this.config.env.authorization_endpoint)}`,
                default: this.config.authorization_endpoint
              }
            }),
        ...(this.config.suppress?.tokenEndpoint
          ? {}
          : {
              tokenEndpoint: {
                description: `OAuth 2.0 token endpoint (will fall back to authorization endpoint if not provided, defaults to environment variable ${Colors.value(this.config.env.token_endpoint)}`,
                default: this.config.token_endpoint
              }
            }),
        ...(this.config.suppress?.tokenPath
          ? {}
          : {
              tokenPath: {
                description: `Path to token storage JSON file (defaults to environent variable ${Colors.value(this.config.env.token_path)}`,
                default: this.config.token_path
              }
            })
      }
    };
  }

  public async init(args: Plugin.ExpectedArguments<typeof this.options>) {
    const {
      values: {
        clientId: client_id = await Env.get({
          key: this.config.env.client_id
        }),
        clientSecret: client_secret = await Env.get({
          key: this.config.env.client_secret
        }),
        redirectUri: redirect_uri = await Env.get({
          key: this.config.env.redirect_uri
        }),
        authorizationEndpoint: authorization_endpoint = await Env.get({
          key: this.config.env.authorization_endpoint
        }),
        tokenEndpoint: token_endpoint = await Env.get({
          key: this.config.env.token_endpoint
        }),
        tokenPath: token_path = await Env.get({
          key: this.config.env.token_path
        })
      }
    } = args;
    this.configure({
      client_id,
      client_secret,
      redirect_uri,
      authorization_endpoint,
      token_endpoint,
      token_path
    });
  }

  private getClient() {
    if (!this.client) {
      const {
        client_id,
        client_secret,
        redirect_uri,
        authorization_endpoint,
        token_endpoint,
        headers,
        store
      } = this.config;
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
      this.client = new OAuth2CLI.Client({
        client_id,
        client_secret,
        redirect_uri,
        authorization_endpoint,
        token_endpoint,
        headers,
        store
      });
    }
    return this.client;
  }

  public async getToken() {
    return await this.getClient().getToken();
  }

  public async request(
    url: RequestURL,
    method: RequestMethod = 'GET',
    body?: RequestBody,
    headers?: RequestHeaders,
    options?: RequestOptions
  ) {
    return await this.getClient().request(url, method, body, headers, options);
  }

  public async requestJSON<T = unknown>(
    url: URL | string,
    method: string = 'GET',
    body?: OpenIDClient.FetchBody,
    headers?: Record<string, string>,
    options?: OpenIDClient.DPoPOptions
  ) {
    return (await this.getClient().requestJSON(
      url,
      method,
      body,
      headers,
      options
    )) as T;
  }
}
