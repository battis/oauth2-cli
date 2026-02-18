import { register } from '@qui-cli/plugin';
import { GitHubPlugin } from './GitHubPlugin.js';

const plugin = new GitHubPlugin();

// @qui-cli/plugin convenience methods
export const configure: typeof plugin.configure = plugin.configure.bind(plugin);
export const options = plugin.options.bind(plugin);
export const init = plugin.options.bind(plugin);

// oauth2-cli convenience methods
export const client: () => typeof plugin.client = () => plugin.client;

/**
 * N.B. both the `typeof` typing to mollify typescript (since the parameter
 * types refer to a sub-dependency of a dependency: requestish) _AND_ the bind()
 * invokation to connect the method up to the specific instances of the object
 * data.
 */
export const request: typeof plugin.request = plugin.request.bind(plugin);
export const requestJSON: typeof plugin.requestJSON =
  plugin.requestJSON.bind(plugin);
export const fetch: typeof plugin.fetch = plugin.fetch.bind(plugin);
export const fetchJSON: typeof plugin.fetchJSON = plugin.fetchJSON.bind(plugin);

// register the plugin for immediate use
await register(plugin);
