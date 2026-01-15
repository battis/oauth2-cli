import { PathString, URLString } from '@battis/descriptive-types';
import { JSONValue } from '@battis/typescript-tricks';
import { Colors } from '@qui-cli/colors';
import { Env } from '@qui-cli/env-1password';
import { Log } from '@qui-cli/log';
import * as Plugin from '@qui-cli/plugin';
import { Root } from '@qui-cli/root';
import path from 'node:path';
import * as OAuth2CLI from 'oauth2-cli';
import { EnvironmentStorage } from './EnvironmentStorage.js';

export * from 'oauth2-cli';
export * from './EnvironmentStorage.js';

type ParamNames =
  | 'clientId'
  | 'clientSecret'
  | 'redirectUri'
  | 'authorizationEndpoint'
  | 'tokenEndpoint'
  | 'tokenPath'
  | 'accessToken';

type EnvironmentVars = Record<ParamNames, string>;
type SupportUrls = Record<ParamNames, URLString>;
type Hints = Record<ParamNames, string>;
type OptionNames = Record<ParamNames, string>;
type OptionSuppression = Record<ParamNames, boolean>;

type Usage = {
  heading: string;
  text?: string[];
};

export type Configuration = Plugin.Configuration & {
  clientId?: string;
  clientSecret?: string;
  redirectUri?: URLString;
  headers?: Record<string, string>;
  authorizationEndpoint?: URLString;
  tokenEndpoint?: URLString;

  store?: OAuth2CLI.TokenStorage;
  tokenPath?: PathString;

  opt: OptionNames;
  url?: Partial<SupportUrls>;
  hint?: Partial<Hints>;
  env: EnvironmentVars;
  man: Usage;
  suppress?: Partial<OptionSuppression>;
};

export type ConfigurationProposal = Partial<
  Omit<Configuration, 'opt' | 'env' | 'man'>
> & {
  opt?: Partial<OptionNames>;
  env?: Partial<EnvironmentVars>;
  man?: Partial<Usage>;
};

export class OAuth2Plugin<C extends OAuth2CLI.Client = OAuth2CLI.Client> {
  [key: string]: unknown;

  private static names: string[] = [];
  private static ports: Record<string, string> = {};

  public constructor(public readonly name = '@oauth2-cli/qui-cli') {
    if (OAuth2Plugin.names.includes(name)) {
      throw new Error(
        `A @qui-cli/plugin named ${Colors.value(name)} has already been instantiated.`
      );
    }
  }

  private cliConfig: Configuration = {
    opt: {
      clientId: 'clientId',
      clientSecret: 'clientSecret',
      redirectUri: 'redirectUri',
      authorizationEndpoint: 'authorizationEndpoint',
      tokenEndpoint: 'tokenEndpoint',
      tokenPath: 'tokenPath',
      accessToken: 'accessToken'
    },
    hint: {
      redirectUri: Colors.quotedValue(`"https://localhost:3000/redirect"`)
    },
    env: {
      clientId: 'CLIENT_ID',
      clientSecret: 'CLIENT_SECRET',
      redirectUri: 'REDIRECT_URI',
      authorizationEndpoint: 'AUTHORIZATION_ENDPOINT',
      tokenEndpoint: 'TOKEN_ENDPOINT',
      tokenPath: 'TOKEN_PATH',
      accessToken: 'ACCESS_TOKEN'
    },
    man: {
      heading: 'OAuth 2.0 client options'
    },
    suppress: {
      tokenPath: true,
      accessToken: true
    }
  };
  private client: C | undefined = undefined;

  public configure(proposal: ConfigurationProposal = {}) {
    for (const key in proposal) {
      if (proposal[key] !== undefined) {
        this.cliConfig[key] = proposal[key];
      }
    }
    if (!this.cliConfig.store) {
      if (this.cliConfig.tokenPath) {
        this.cliConfig.store = new OAuth2CLI.FileStorage(
          path.resolve(Root.path(), this.cliConfig.tokenPath)
        );
      } else {
        this.cliConfig.store = new EnvironmentStorage(
          this.cliConfig.env.accessToken
        );
      }
    }

    if (this.cliConfig.redirectUri) {
      const url = new URL(this.cliConfig.redirectUri);
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
      if (
        OAuth2Plugin.ports[url.port] &&
        OAuth2Plugin.ports[url.port] !== this.name
      ) {
        Log.warning(
          `The port ${Colors.value(
            url.port
          )} has already been registered to another instance of this plugin ` +
            `named ${Colors.value(
              OAuth2Plugin.ports[url.port]
            )}. This will likely cause a failure if both instances of the ` +
            `plugin are listening for redirects at relatively proximate ` +
            `moments in time.`
        );
      }
    }
  }

  public options(): Plugin.Options {
    const descriptions: Record<ParamNames, string> = {
      clientId:
        `OAuth 2.0 client ID. Defaults to environment variable ` +
        `${Colors.value(this.cliConfig.env.clientId)}, if present.`,
      clientSecret:
        `OAuth 2.0 client secret. Defaults to environment variable ` +
        `${Colors.value(this.cliConfig.env.clientSecret)}, if present.`,
      redirectUri:
        `OAuth 2.0 redirect URI, must be to host ${Colors.url('localhost')}. ` +
        `Defaults to environment variable ` +
        `${Colors.value(this.cliConfig.env.redirectUri)}, if present.`,
      authorizationEndpoint:
        `OAuth 2.0 authorization endpoint. Defaults to environment variable ` +
        `${Colors.value(this.cliConfig.env.authorizationEndpoint)}, if present.`,
      tokenEndpoint:
        `OAuth 2.0 token endpoint, will fall back to ` +
        `${Colors.optionArg(`--${this.cliConfig.opt['authorizationEndpoint']}`)} if ` +
        `not provided. Defaults to environment ariable ` +
        `${Colors.value(this.cliConfig.env.tokenEndpoint)}, if present.`,
      tokenPath:
        `Path to token storage JSON file. Defaults to environent variable ` +
        `${Colors.value(this.cliConfig.env.tokenPath)}, if present.`,
      accessToken:
        `Access token JSON object value. Defaults to environment variable ` +
        `${Colors.value(this.cliConfig.env.accessToken)}, if present.`
    };

    const opt: Plugin.Options['opt'] = {};
    for (const paramName of Object.keys(descriptions) as ParamNames[]) {
      if (!this.cliConfig.suppress || !this.cliConfig.suppress[paramName]) {
        const option: {
          description: string;
          hint?: string;
          secret?: boolean;
          default?: string;
        } = { description: descriptions[paramName] };
        if (this.cliConfig.url && this.cliConfig.url[paramName]) {
          option.description = `${option.description} See ${Colors.url(this.cliConfig.url[paramName])} for more information.`;
        }
        if (this.cliConfig.hint && this.cliConfig.hint[paramName]) {
          option.hint = this.cliConfig.hint[paramName];
        }
        switch (paramName) {
          case 'clientId':
          case 'clientSecret':
          case 'accessToken':
            option.secret = true;
        }
        const param = this.cliConfig[paramName];
        if (typeof param === 'string') {
          option.default = param;
        }
        opt[this.cliConfig.opt[paramName]] = option;
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

  public async init({ values }: Plugin.ExpectedArguments<typeof this.options>) {
    const proposal: ConfigurationProposal = {};
    let paramName: ParamNames;
    for (paramName of Object.keys(this.cliConfig.opt) as ParamNames[]) {
      proposal[paramName] =
        values[this.cliConfig.opt[paramName]] ||
        this.cliConfig[paramName] ||
        (await Env.get({ key: this.cliConfig.env[paramName] }));
    }
    this.configure(proposal);
  }

  protected instantiateClient(
    ...args: ConstructorParameters<typeof OAuth2CLI.Client>
  ): C {
    return new OAuth2CLI.Client(...args) as C;
  }

  public getClient(): C {
    if (!this.client) {
      const {
        clientId: client_id,
        clientSecret: client_secret,
        redirectUri: redirect_uri,
        authorizationEndpoint: authorization_endpoint,
        tokenEndpoint: token_endpoint,
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
      this.client = this.instantiateClient({
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

  public getToken() {
    return this.getClient().getToken();
  }

  public request(...args: Parameters<OAuth2CLI.Client['request']>) {
    return this.getClient().request(...args);
  }

  public requestJSON<T extends JSONValue>(
    ...args: Parameters<OAuth2CLI.Client['requestJSON']>
  ) {
    return this.getClient().requestJSON<T>(...args);
  }

  public fetch(...args: Parameters<OAuth2CLI.Client['fetch']>) {
    return this.getClient().fetch(...args);
  }

  public fetchJSON<T extends JSONValue>(
    ...args: Parameters<OAuth2CLI.Client['fetchJSON']>
  ) {
    return this.getClient().fetchJSON<T>(...args);
  }
}
