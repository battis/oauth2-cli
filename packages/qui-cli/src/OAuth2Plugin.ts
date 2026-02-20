import { URLString } from '@battis/descriptive-types';
import { JSONValue } from '@battis/typescript-tricks';
import { Colors } from '@qui-cli/colors';
import { Env } from '@qui-cli/env';
import { Log } from '@qui-cli/log';
import * as Plugin from '@qui-cli/plugin';
import * as OAuth2CLI from 'oauth2-cli';
import { URL } from 'requestish';
import { Client } from './Client.js';

type CredentialKey =
  | 'issuer'
  | 'client_id'
  | 'client_secret'
  | 'redirect_uri'
  | 'authorization_endpoint'
  | 'token_endpoint'
  | 'scope'
  | 'base_url';

type EnvironmentVars = Record<CredentialKey, string>;
type SupportUrls = Record<CredentialKey, URLString>;
type Hints = Record<CredentialKey, string>;
type EnvVarSuppression = Record<CredentialKey, boolean>;

type Usage = {
  heading: string;
  text?: string[];
};

export type Configuration<
  C extends OAuth2CLI.Credentials = OAuth2CLI.Credentials
> = Plugin.Configuration & {
  /** Human-readable name for client in messages. */
  name?: string;

  /** OAuth 2.0/OpenID Connect credential set */
  credentials?: Partial<C>;

  /** Base URL for all non-absolute requests */
  base_url?: URL.ish;

  /** Request components to inject into server requests */
  inject?: OAuth2CLI.Injection;

  /** Refresh token storage service */
  storage?: OAuth2CLI.Token.Storage;

  /** CLI usage section header and text */
  man?: Usage;

  /** Reference URLs for particular credential values */
  url?: Partial<SupportUrls>;

  /** Hint values for particular credential values */
  hint?: Partial<Hints>;

  /** Actual environment variable names for each credential value */
  env?: Partial<EnvironmentVars>;

  /** Should a particular credential value _not_ be loaded from the environment? */
  suppress?: Partial<EnvVarSuppression>;

  localhost?: OAuth2CLI.Options['localhost'];
};

export class OAuth2Plugin<
  C extends OAuth2CLI.Credentials = OAuth2CLI.Credentials,
  L extends Client<C> = Client<C>
> {
  [key: string]: unknown;

  private static names: string[] = [];
  private static registeredPorts: Record<string, string> = {};

  private overrideName?: string;

  /**
   * @param name Human-readable name for client in messages. Must also be a
   *   unique qui-cli plugin name.
   */
  public constructor(public readonly name = '@oauth2-cli/qui-cli') {
    if (OAuth2Plugin.names.includes(name)) {
      throw new Error(
        `A @qui-cli/plugin named ${Colors.value(name)} has already been instantiated.`
      );
    }
  }

  private credentials?: C;

  private base_url?: URL.ish;

  private man: Usage = {
    heading: 'OAuth 2.0 / Open ID Connect client options'
  };

  private url?: Partial<SupportUrls> = undefined;

  private hint: Partial<Hints> = {
    redirect_uri: Colors.quotedValue(`"http://localhost:3000/redirect"`)
  };

  private env: EnvironmentVars = {
    issuer: 'ISSUER',
    client_id: 'CLIENT_ID',
    client_secret: 'CLIENT_SECRET',
    redirect_uri: 'REDIRECT_URI',
    authorization_endpoint: 'AUTHORIZATION_ENDPOINT',
    token_endpoint: 'TOKEN_ENDPOINT',
    base_url: 'BASE_URL',
    scope: 'SCOPE'
  };

  private suppress?: Partial<EnvVarSuppression> = {
    scope: true
  };

  private inject?: OAuth2CLI.Injection = undefined;

  private localhost?: OAuth2CLI.Options['localhost'];

  private storage?: OAuth2CLI.Token.Storage = undefined;

  private _client?: L = undefined;

  public configure(proposal: Configuration<C> = {}) {
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

    this.overrideName = Plugin.hydrate(proposal.name, this.overrideName);
    this.credentials = hydrate(proposal.credentials, this.credentials);
    this.base_url = Plugin.hydrate(proposal.base_url, this.base_url);
    this.storage = Plugin.hydrate(proposal.storage, this.storage);
    this.inject = hydrate(proposal.inject, this.inject);
    this.man = Plugin.hydrate(proposal.man, this.man);
    this.url = hydrate(proposal.url, this.url);
    this.hint = hydrate(proposal.hint, this.hint);
    this.env = hydrate(proposal.env, this.env);
    this.suppress = hydrate(proposal.suppress, this.suppress);
    this.localhost = hydrate(proposal.localhost, this.localhost);

    if (this.credentials?.redirect_uri) {
      const url = URL.from(this.credentials.redirect_uri);
      if (
        url.hostname !== 'localhost' &&
        !/^\/https?\/localhost(:\d+)?\//.test(url.pathname)
      ) {
        Log.warning(
          `The ${Colors.varName(this.env.redirect_uri)} value ${Colors.url(
            this.credentials.redirect_uri
          )} for ${this.overrideName || this.name} may not work: it ` +
            `${Colors.keyword('must')} redirect to ${Colors.url('localhost')}`
        );
      }
      if (
        url.protocol !== 'http:' &&
        !/^\/http\/localhost(:\d+)?\//.test(url.pathname)
      ) {
        Log.warning(
          `The ${Colors.url(
            url.protocol
          )} protocol may not work without additional configuration. The out-` +
            `of-band server listening for the ` +
            `${this.overrideName || this.name} redirect is not automatically ` +
            `provisioned with an SSL certificate`
        );
      }
      if (
        OAuth2Plugin.registeredPorts[url.port] &&
        OAuth2Plugin.registeredPorts[url.port] !== this.name
      ) {
        Log.warning(
          `The port ${Colors.value(
            url.port
          )} has already been registered to another instance of this plugin ` +
            `named ${Colors.value(
              OAuth2Plugin.registeredPorts[url.port]
            )}. This will likely cause a failure if both ` +
            `${this.overrideName || this.name} and ` +
            `${OAuth2Plugin.registeredPorts[url.port]} are listening for ` +
            `redirects at relatively proximate moments in time.`
        );
      }
    }
  }

  public options(): Plugin.Options {
    const descriptions: Record<CredentialKey, string> = {
      issuer:
        `The OpenID ${Colors.keyword('issuer')} URL is set from the ` +
        `environment variable ${Colors.varName(this.env.issuer)}, if present. ` +
        `The ${Colors.varName(this.env.issuer)} is also used as a base URL for ` +
        `any relative URL in API requests, unless ` +
        `${Colors.varName(this.env.base_url)} is defined.`,
      client_id:
        `The OAuth 2.0 ${Colors.keyword('client_id')} is set from the ` +
        `environment variable ${Colors.varName(this.env.client_id)}, if ` +
        `present.`,
      client_secret:
        `The OAuth 2.0 ${Colors.keyword('client_secret')} is set from the ` +
        `environment variable ${Colors.varName(this.env.client_secret)}, if ` +
        `present.`,
      scope:
        `The OAuth 2.0 ${Colors.keyword('scope')} is set from the environment ` +
        `variable ${Colors.varName(this.env.scope)}, if present.`,
      redirect_uri:
        `The OAuth 2.0 ${Colors.keyword('redirect_uri')}, which must at least ` +
        `redirect to ${Colors.url('localhost')}, is set from the environment ` +
        `variable ${Colors.varName(this.env.redirect_uri)}, if present.`,
      authorization_endpoint:
        `The OAuth 2.0 ${Colors.keyword('authorization_endpoint')} is set ` +
        `from the environment variable ` +
        `${Colors.varName(this.env.authorization_endpoint)}, if present.`,
      token_endpoint:
        `The OAuth 2.0 ${Colors.keyword('token_endpoint')} is set from the ` +
        `environment variable ${Colors.varName(this.env.token_endpoint)}, if ` +
        `present and will fall back to ` +
        `${Colors.varName(this.env.authorization_endpoint)} if not provided.`,
      base_url:
        `The base URL to use for API requests is set from the ` +
        `environment variable ${Colors.varName(this.env.base_url)}, if ` +
        `present. If ${Colors.varName(this.env.base_url)} is not defined, ` +
        `${Colors.varName(this.env.issuer)} will be used as a base URL for ` +
        `relative URL requests.`
    };

    return {
      man: [
        { level: 1, text: this.man.heading },
        ...(Object.keys(descriptions) as CredentialKey[])
          .filter((key) => !this.suppress || !this.suppress[key])
          .map((key) => ({
            text:
              descriptions[key] +
              (this.hint[key] ? ` (e.g. ${this.hint[key]})` : '') +
              (this.url && this.url[key]
                ? ` See ${Colors.url(this.url[key])} for more information.`
                : '')
          })),
        ...(this.man.text || []).map((t) => ({ text: t }))
      ]
    };
  }

  public async init(_: Plugin.ExpectedArguments<typeof this.options>) {
    const credentials: Configuration<C>['credentials'] = {};
    const base_url =
      this.base_url ||
      (await Env.get({
        key: this.env.base_url
      }));
    for (const key of Object.keys(this.env) as CredentialKey[]) {
      if (key !== 'base_url') {
        // FIXME better typing
        // @ts-expect-error 2322
        credentials[key] =
          (this.credentials ? this.credentials[key] : undefined) ||
          (await Env.get({ key: this.env[key] }));
      }
    }
    this.configure({ credentials, base_url });
  }

  protected instantiateClient(options: OAuth2CLI.Options<C>): L {
    return new OAuth2CLI.Client<C>(options) as L;
  }
  public get client(): L {
    if (!this._client) {
      if (!this.credentials?.client_id) {
        throw new Error(
          `A ${Colors.varName(this.env.client_id)} ${Colors.keyword('must')} ` +
            `be configured for ${this.overrideName || this.name}.`
        );
      }
      if (!this.credentials?.client_secret) {
        throw new Error(
          `A ${Colors.varName(this.env.client_secret)} ${Colors.keyword('must')} ` +
            `be configured for ${this.overrideName || this.name}.`
        );
      }
      if (!this.credentials?.redirect_uri) {
        throw new Error(
          `A ${Colors.varName(this.env.redirect_uri)} ${Colors.keyword('must')} ` +
            `be configured for ${this.overrideName || this.name}.`
        );
      }
      if (!this.credentials?.issuer) {
        if (!this.credentials?.authorization_endpoint) {
          throw new Error(
            `Either an ${Colors.varName(this.env.issuer)} or ` +
              `${Colors.varName(this.env.authorization_endpoint)} ` +
              `${Colors.keyword('must')} be configured for ` +
              `${this.overrideName || this.name}.`
          );
        }
        if (!this.credentials?.token_endpoint) {
          throw new Error(
            `Either an ${Colors.varName(this.env.issuer)} or ` +
              `${Colors.varName(this.env.token_endpoint)} ` +
              `${Colors.keyword('must')} be configured for ` +
              `${this.overrideName || this.name}.`
          );
        }
      }
      this._client = this.instantiateClient({
        name: this.overrideName || this.name,
        credentials: this.credentials,
        base_url: this.base_url,
        inject: this.inject,
        localhost: this.localhost,
        storage: this.storage
      });
    }
    return this._client;
  }

  public request(...args: Parameters<OAuth2CLI.Client<C>['request']>) {
    return this.client.request(...args);
  }

  public requestJSON<T extends JSONValue>(
    ...args: Parameters<OAuth2CLI.Client<C>['requestJSON']>
  ) {
    return this.client.requestJSON<T>(...args);
  }

  public fetch(...args: Parameters<OAuth2CLI.Client<C>['fetch']>) {
    return this.client.fetch(...args);
  }

  public fetchJSON<T extends JSONValue>(
    ...args: Parameters<OAuth2CLI.Client<C>['fetchJSON']>
  ) {
    return this.client.fetchJSON<T>(...args);
  }
}
