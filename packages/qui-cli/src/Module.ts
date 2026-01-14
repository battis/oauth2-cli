import { OAuth2 } from './OAuth2.js';

export * from './OAuth2.js';

const plugin = new OAuth2();

export const name = plugin.name;
export const configure = plugin.configure.bind(plugin);
export const options = plugin.options.bind(plugin);
export const init = plugin.init.bind(plugin);

export const getToken = plugin.getToken.bind(plugin);
export const getClient = plugin.getClient.bind(plugin);
export const request = plugin.request.bind(plugin);
export const requestJSON = plugin.requestJSON.bind(plugin);
export const fetch = plugin.fetch.bind(plugin);
export const fetchJSON = plugin.fetchJSON.bind(plugin);
