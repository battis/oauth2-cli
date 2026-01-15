import { OAuth2Plugin } from './OAuth2.js';

export * from './OAuth2.js';

const oauth2 = new OAuth2Plugin();

export const name = oauth2.name;
export const configure = oauth2.configure.bind(oauth2);
export const options = oauth2.options.bind(oauth2);
export const init = oauth2.init.bind(oauth2);

export const getToken = oauth2.getToken.bind(oauth2);
export const getClient = oauth2.getClient.bind(oauth2);
export const request = oauth2.request.bind(oauth2);
export const requestJSON = oauth2.requestJSON.bind(oauth2);
export const fetch = oauth2.fetch.bind(oauth2);
export const fetchJSON = oauth2.fetchJSON.bind(oauth2);
