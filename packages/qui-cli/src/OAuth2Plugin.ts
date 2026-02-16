import { URLString } from '@battis/descriptive-types';
import { JSONValue } from '@battis/typescript-tricks';
import { Colors } from '@qui-cli/colors';
import { Env } from '@qui-cli/env';
import { Log } from '@qui-cli/log';
import * as Plugin from '@qui-cli/plugin';
import * as OAuth2CLI from 'oauth2-cli';
import * as requestish from 'requestish';
import { Client } from './Client.js';

type CredentialKey =
  | 'issuer'
  | 'client_id'
  | 'client_secret'
  | 'redirect_uri'
  | 'authorization_endpoint'
  | 'token_endpoint'
  | 'scope';

type EnvironmentVars = Record<CredentialKey, string>;
type SupportUrls = Record<CredentialKey, URLString>;
type Hints = Record<CredentialKey, string>;
type OptionNames = Record<CredentialKey, string>;
type OptionSuppression = Record<CredentialKey, boolean>;

type Usage = {
  heading: string;
  text?: string[];
};

export type Configuration = Plugin.Configuration & {
  credentials?: Partial<OAuth2CLI.Credentials.Combined>;

  inject?: OAuth2CLI.Request.Injection;
  storage?: OAuth2CLI.Token.TokenStorage;

  man?: Usage;
  opt?: Partial<OptionNames>;
  url?: Partial<SupportUrls>;
  hint?: Partial<Hints>;
  env?: Partial<EnvironmentVars>;
  suppress?: Partial<OptionSuppression>;
};

export class OAuth2Plugin<C extends Client = Client> {
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

  private credentials?: OAuth2CLI.Credentials.Combined;

  private man: Usage = {
    heading: 'OAuth 2.0 client options'
  };

  private opt: OptionNames = {
    issuer: 'issuer',
    client_id: 'clientId',
    client_secret: 'clientSecret',
    scope: 'scope',
    redirect_uri: 'redirectUri',
    authorization_endpoint: 'authorizationEndpoint',
    token_endpoint: 'tokenEndpoint'
  };

  private url: Partial<SupportUrls> | undefined = undefined;

  private hint: Partial<Hints> = {
    redirect_uri: Colors.quotedValue(`"http://localhost:3000/redirect"`)
  };

  private env: EnvironmentVars = {
    issuer: 'ISSUER',
    client_id: 'CLIENT_ID',
    client_secret: 'CLIENT_SECRET',
    scope: 'SCOPE',
    redirect_uri: 'REDIRECT_URI',
    authorization_endpoint: 'AUTHORIZATION_ENDPOINT',
    token_endpoint: 'TOKEN_ENDPOINT'
  };

  private suppress: Partial<OptionSuppression> | undefined = undefined;

  private inject: OAuth2CLI.Request.Injection | undefined = undefined;

  private storage?: OAuth2CLI.Token.TokenStorage | undefined = undefined;

  private _client: C | undefined = undefined;

  public configure(proposal: Configuration = {}) {
    function hydrate<T>(p: T | Partial<T> | undefined, c: T) {
      if (p) {
        for (const k of Object.keys(p) as (keyof typeof p)[]) {
          if (p[k] !== undefined) {
            if (!c) {
              c = {} as T;
            }
            c[k] = p[k];
          }
        }
      }
      return c;
    }

    this.credentials = hydrate(proposal.credentials, this.credentials);
    this.storage = Plugin.hydrate(proposal.storage, this.storage);
    this.inject = hydrate(proposal.inject, this.inject);
    this.man = Plugin.hydrate(proposal.man, this.man);
    this.opt = hydrate(proposal.opt, this.opt);
    this.url = hydrate(proposal.url, this.url);
    this.hint = hydrate(proposal.hint, this.hint);
    this.env = hydrate(proposal.env, this.env);
    this.suppress = hydrate(proposal.suppress, this.suppress);

    if (this.credentials?.redirect_uri) {
      const url = requestish.URL.from(this.credentials.redirect_uri);
      if (
        url.hostname !== 'localhost' &&
        !/^\/https?\/localhost(:\d+)?\//.test(url.pathname)
      ) {
        Log.warning(
          `The ${Colors.optionArg(this.opt.redirect_uri)} value ${Colors.url(
            this.credentials.redirect_uri
          )} may not work: it ${Colors.keyword('must')} redirect to ${Colors.url(
            'localhost'
          )}`
        );
      }
      if (
        url.protocol !== 'http:' &&
        !/^\/http\/localhost(:\d+)?\//.test(url.pathname)
      ) {
        Log.warning(
          `The ${Colors.url(
            url.protocol
          )} protocol may not work without additional configuration. The ` +
            `server listening for the redirect is not automatically ` +
            `provisioned with an SSL certificate`
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
    const descriptions: Record<CredentialKey, string> = {
      issuer:
        `OpenID issuer URL. Defaults to environment variable ` +
        `${Colors.varName(this.env.issuer)}, if present.`,
      client_id:
        `OAuth 2.0 client ID. Defaults to environment variable ` +
        `${Colors.varName(this.env.client_id)}, if present.`,
      client_secret:
        `OAuth 2.0 client secret. Defaults to environment variable ` +
        `${Colors.varName(this.env.client_secret)}, if present.`,
      scope:
        `OAuth 2.0 scope. Defaults to environment variable ` +
        `${Colors.varName(this.env.scope)}, if present.`,
      redirect_uri:
        `OAuth 2.0 redirect URI, must be to host ${Colors.url('localhost')}. ` +
        `Defaults to environment variable ` +
        `${Colors.varName(this.env.redirect_uri)}, if present.`,
      authorization_endpoint:
        `OAuth 2.0 authorization endpoint. Defaults to environment variable ` +
        `${Colors.varName(this.env.authorization_endpoint)}, if present.`,
      token_endpoint:
        `OAuth 2.0 token endpoint, will fall back to ` +
        `${Colors.optionArg(`--${this.opt.authorization_endpoint}`)} if ` +
        `not provided. Defaults to environment variable ` +
        `${Colors.varName(this.env.token_endpoint)}, if present.`
    };

    const opt: Plugin.Options['opt'] = {};
    for (const paramName of Object.keys(descriptions) as CredentialKey[]) {
      if (!this.suppress || !this.suppress[paramName]) {
        const option: {
          description: string;
          hint?: string;
          secret?: boolean;
          default?: string;
        } = { description: descriptions[paramName] };
        if (this.url && this.url[paramName]) {
          option.description = `${option.description} See ${Colors.url(this.url[paramName])} for more information.`;
        }
        if (this.hint[paramName]) {
          option.hint = this.hint[paramName];
        }
        switch (paramName) {
          case 'client_id':
          case 'client_secret':
            option.secret = true;
        }
        const param = this.credentials
          ? this.credentials[paramName]
          : undefined;
        if (typeof param === 'string') {
          option.default = param;
        }
        opt[this.opt[paramName]] = option;
      }
    }

    return {
      man: [
        { level: 1, text: this.man.heading },
        ...(this.man.text || []).map((t) => ({ text: t }))
      ],
      opt
    };
  }

  public async init({ values }: Plugin.ExpectedArguments<typeof this.options>) {
    const credentials: Configuration['credentials'] = {};
    for (const key of Object.keys(this.opt) as CredentialKey[]) {
      credentials[key] =
        values[this.opt[key]] ||
        (this.credentials ? this.credentials[key] : undefined) ||
        (await Env.get({ key: this.env[key] }));
    }
    this.configure({ credentials });
  }

  protected instantiateClient(options: OAuth2CLI.ClientOptions): C {
    return new OAuth2CLI.Client(options) as C;
  }

  public get client(): C {
    if (!this._client) {
      if (!this.credentials?.client_id) {
        throw new Error(
          `A ${Colors.optionArg(this.opt.client_id)} ${Colors.keyword('must')} be configured.`
        );
      }
      if (!this.credentials?.client_secret) {
        throw new Error(
          `A ${Colors.optionArg(this.opt.client_secret)} ${Colors.keyword('must')} be configured.`
        );
      }
      if (!this.credentials?.redirect_uri) {
        throw new Error(
          `A ${Colors.optionArg(this.opt.redirect_uri)} ${Colors.keyword('must')} be configured.`
        );
      }
      if (!this.credentials?.issuer) {
        if (!this.credentials?.authorization_endpoint) {
          throw new Error(
            `Either an ${Colors.optionArg(this.opt.issuer)} or ` +
              `${Colors.optionArg(this.opt.authorization_endpoint)} ` +
              `${Colors.keyword('must')} be configured.`
          );
        }
        if (!this.credentials?.token_endpoint) {
          throw new Error(
            `Either an ${Colors.optionArg(this.opt.issuer)} or ` +
              `${Colors.optionArg(this.opt.token_endpoint)} ` +
              `${Colors.keyword('must')} be configured.`
          );
        }
      }
      this._client = this.instantiateClient({
        credentials: this.credentials,
        headers: this.inject?.headers,
        storage: this.storage
      });
    }
    return this._client;
  }

  public request(...args: Parameters<OAuth2CLI.Client['request']>) {
    return this.client.request(...args);
  }

  public requestJSON<T extends JSONValue>(
    ...args: Parameters<OAuth2CLI.Client['requestJSON']>
  ) {
    return this.client.requestJSON<T>(...args);
  }

  public fetch(...args: Parameters<OAuth2CLI.Client['fetch']>) {
    return this.client.fetch(...args);
  }

  public fetchJSON<T extends JSONValue>(
    ...args: Parameters<OAuth2CLI.Client['fetchJSON']>
  ) {
    return this.client.fetchJSON<T>(...args);
  }
}
