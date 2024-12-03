import cli from '@battis/qui-cli';
import { SkyAPI } from 'sky-oauth2-cli';

const {
  positionals: [tokenPath],
  values: {
    clientId: client_id = process.env.CLIENT_ID,
    clientSecret: client_secret = process.env.CLIENT_SECRET,
    subscriptionKey: subscription_key = process.env.SUBSCRIPTION_KEY,
    redirectUri: redirect_uri = process.env.REDIRECT_URI
  }
} = cli.init({
  env: { root: process.cwd() },
  args: {
    requirePositionals: 1,
    options: {
      clientId: { description: 'Required' },
      clientSecret: { description: 'Required' },
      subscriptionKey: { description: 'Required' },
      redirectUri: { description: 'Required' }
    }
  }
});

if (!client_id || !client_secret || !redirect_uri || !subscription_key) {
  throw new Error('Missing required argument');
}

const sky = new SkyAPI({
  client_id,
  client_secret,
  subscription_key,
  redirect_uri,
  store: tokenPath
});
cli.log.info((await sky.fetch('school/v1/events/calendar')) || 'no response');
