import { register } from '@qui-cli/plugin';
import { OAuth2Plugin } from './OAuth2Plugin.js';

/** Auto-registered @oauth2-clu/qui-cli plugin */
const plugin = new OAuth2Plugin();

// @qui-cli/plugin convenience methods
/**
 * Convenience method
 *
 * @see {@link OAuth2Plugin.configure}
 */
export const configure = plugin.configure.bind(plugin);

/**
 * Convenience method
 *
 * @see {@link OAuth2Plugin.options}
 */
export const options = plugin.options.bind(plugin);

/**
 * Convenience method
 *
 * @see {@link OAuth2Plugin.init}
 */
export const init = plugin.options.bind(plugin);

// oauth2-cli convenience methods
/**
 * Convenience method
 *
 * @see {@link OAuth2Plugin.client}
 */
export const client = () => plugin.client;

/**
 * Convenience method
 *
 * @see {@link OAuth2Plugin.requestRaw}
 */
export const requestRaw = plugin.requestRaw.bind(plugin);

/**
 * Convenience method
 *
 * @see {@link OAuth2Plugin.request}
 */
export const request = plugin.request.bind(plugin);

/**
 * Convenience method
 *
 * @see {@link OAuth2Plugin.fetchRaw}
 */
export const fetchRaw = plugin.fetchRaw.bind(plugin);

/**
 * Conveneince method
 *
 * @see {@link OAuth2Plugin.fetch}
 */
export const fetch = plugin.fetch.bind(plugin);

await register(plugin);
