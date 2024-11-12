import { Credentials } from '../authorize.js';

type Result = {
  credentials?: Credentials;
  tokenPath?: string;
};

export function parse(values: Record<string, string>): Result {
  const credentials = {
    client_id: values.clientId || process.env.CLIENT_ID,
    client_secret: values.clientSecret || process.env.CLIENT_SECRET,
    redirect_uri: values.redirectUri || process.env.REDIRECT_URI,
    'Bb-api-subscription-key':
      values.subscriptionKey || process.env.SUBSCRIPTION_KEY
  };

  return {
    credentials:
      credentials.client_id &&
      credentials.client_secret &&
      credentials.redirect_uri &&
      credentials['Bb-api-subscription-key']
        ? (credentials as Credentials)
        : undefined,
    tokenPath: values.tokenPath
  };
}
