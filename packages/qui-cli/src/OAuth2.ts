import { register } from '@qui-cli/plugin';
import { OAuth2Plugin } from './OAuth2Plugin.js';

const plugin = new OAuth2Plugin();

// @qui-cli/plugin convenience methods
export const configure = plugin.configure.bind(plugin);
export const options = plugin.options.bind(plugin);
export const init = plugin.options.bind(plugin);

// oauth2-cli convenience methods
export const client = () => plugin.client;
export const request = plugin.request.bind(plugin);
export const requestJSON = plugin.requestJSON.bind(plugin);
export const fetch = plugin.fetch.bind(plugin);
export const fetchJSON = plugin.fetchJSON.bind(plugin);

await register(plugin);
