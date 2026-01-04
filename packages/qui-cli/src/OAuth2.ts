import { PathString, URLString } from '@battis/descriptive-types';
import { JSONValue } from '@battis/typescript-tricks';
import { Colors } from '@qui-cli/colors';
import '@qui-cli/env-1password';
import { Env } from '@qui-cli/env-1password';
import { Log } from '@qui-cli/log';
import * as Plugin from '@qui-cli/plugin';
import { Root } from '@qui-cli/root';
import path from 'node:path';
import * as OAuth2CLI from 'oauth2-cli';
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

export type ConfigurationProposal = Partial<
  Omit<Configuration, 'env' | 'man' | 'suppress'>
> & {
  env?: Partial<EnvironmentVars>;
  man?: Partial<Usage>;
  suppress?: Partial<OptionSuppression>;
};

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

  private cliConfig: Configuration = {
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

  public configure(proposal: ConfigurationProposal = {}) {
    for (const key in proposal) {
      if (proposal[key] !== undefined) {
        this.cliConfig[key] = proposal[key];
      }
    }
    if (!this.cliConfig.store) {
      if (this.cliConfig.token_path) {
        this.cliConfig.store = new OAuth2CLI.FileStorage(
          path.resolve(Root.path(), this.cliConfig.token_path)
        );
      } else {
        this.cliConfig.store = new EnvironmentStorage(
          this.cliConfig.env.access_token
        );
      }
    }

    if (this.cliConfig.redirect_uri) {
      const url = new URL(this.cliConfig.redirect_uri);
      if (url.hostname !== 'localhost') {
        Log.warning(
          `The ${Colors.varName('redirect_uri')} value ${Colors.url(
            this.cliConfig.redirect_uri
          )} may not work: it ${Colors.keyword('must')} point to ${Colors.url(
            'localhost'
          )}`
        );
      }
      if (url.protocol !== 'http:') {
        Log.warning(
          `The ${Colors.url(
            url.protocol
          )} protocol may not work without additional configuration. The ` +
            `server listening for the redirect will be running at ${Colors.url(
              `http://localhost:${url.port}`
            )}`
        );
      }
      if (OAuth2.ports[url.port] && OAuth2.ports[url.port] !== this.name) {
        Log.warning(
          `The port ${Colors.value(
            url.port
          )} has already been registered to another instance of this plugin ` +
            `named ${Colors.value(
              OAuth2.ports[url.port]
            )}. This will likely cause a failure if both instances of the ` +
            `plugin are listening for redirects at relatively proximate ` +
            `moments in time.`
        );
      }
    }
  }

  public options(): Plugin.Options {
    const opt: Plugin.Options['opt'] = {
      clientId: {
        description:
          `OAuth 2.0 client ID (defaults to environment variable ` +
          `${Colors.value(this.cliConfig.env.client_id)})`,
        secret: true,
        default: this.cliConfig.client_id
      },
      clientSecret: {
        description:
          `OAuth 2.0 client secret (defaults to environment ` +
          `variable ${Colors.value(this.cliConfig.env.client_secret)}`,
        secret: true,
        default: this.cliConfig.client_secret
      },
      redirectUri: {
        description:
          `OAuth 2.0 redirect URI (must be to host ` +
          `${Colors.url('localhost')}, defaults to environment variables ` +
          `${Colors.value(this.cliConfig.env.redirect_uri)})`,
        hint: Colors.quotedValue(`"http://localhost:XXXX/path/to/redirect"`),
        default: this.cliConfig.redirect_uri
      },
      authorizationEndpoint: {
        description:
          `OAuth 2.0 authorization endpoint (defaults to ` +
          `environment variable ${Colors.value(this.cliConfig.env.authorization_endpoint)}`,
        default: this.cliConfig.authorization_endpoint
      },
      tokenEndpoint: {
        description:
          `OAuth 2.0 token endpoint (will fall back to ` +
          `authorization endpoint if not provided, defaults to environment ` +
          `variable ${Colors.value(this.cliConfig.env.token_endpoint)}`,
        default: this.cliConfig.token_endpoint
      },
      tokenPath: {
        description:
          `Path to token storage JSON file (defaults to environent ` +
          `variable ${Colors.value(this.cliConfig.env.token_path)}`,
        default: this.cliConfig.token_path
      }
    };

    if (this.cliConfig.suppress) {
      let option: string & keyof OptionSuppression;
      for (option in this.cliConfig.suppress) {
        if (this.cliConfig.suppress[option]) {
          delete opt[option];
        }
      }
    }

    return {
      man: [
        { level: 1, text: this.cliConfig.man.heading },
        ...(this.cliConfig.man.text || []).map((t) => ({ text: t }))
      ],
      opt
    };
  }

  public async init(args: Plugin.ExpectedArguments<typeof this.options>) {
    const {
      values: {
        clientId: client_id = await Env.get({
          key: this.cliConfig.env.client_id
        }),
        clientSecret: client_secret = await Env.get({
          key: this.cliConfig.env.client_secret
        }),
        redirectUri: redirect_uri = await Env.get({
          key: this.cliConfig.env.redirect_uri
        }),
        authorizationEndpoint: authorization_endpoint = await Env.get({
          key: this.cliConfig.env.authorization_endpoint
        }),
        tokenEndpoint: token_endpoint = await Env.get({
          key: this.cliConfig.env.token_endpoint
        }),
        tokenPath: token_path = await Env.get({
          key: this.cliConfig.env.token_path
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

  public getClient() {
    if (!this.client) {
      const {
        client_id,
        client_secret,
        redirect_uri,
        authorization_endpoint,
        token_endpoint,
        headers,
        store
      } = this.cliConfig;
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

  public getToken = () => this.getClient().getToken();
  public request = (...args: Parameters<OAuth2CLI.Client['request']>) =>
    this.getClient().request(...args);
  public fetch = (...args: Parameters<OAuth2CLI.Client['fetch']>) =>
    this.getClient().fetch(...args);
  public requestJSON = <T extends JSONValue>(
    ...args: Parameters<OAuth2CLI.Client['requestJSON']>
  ) => this.getClient().requestJSON<T>(...args);
  public fetchJSON = <T extends JSONValue>(
    ...args: Parameters<OAuth2CLI.Client['fetchJSON']>
  ) => this.getClient().fetchJSON<T>(...args);
}
