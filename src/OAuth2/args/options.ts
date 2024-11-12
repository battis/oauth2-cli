import cli from '@battis/qui-cli';

export const options = {
  clientId: {
    description: `Required to snapshot assignments. OAuth 2.0 client ID of a Blackbaud SKY API app with read-access to the School API (default: environment variable ${cli.colors.value('$CLIENT_ID')} if present)`
  },
  clientSecret: {
    description: `Required to snapshot assignments. OAuth 2.0 client secret of a Blackbaud SKY API app with read-access to the School API (default: environment variable ${cli.colors.value('$CLIENT_SECRET')} if present)`
  },
  redirectUri: {
    description: `Required to snapshot assignments. OAuth 2.0 redirect URI of a Blackbaud SKY API app with read-access to the School API (default: environment variable ${cli.colors.value('$CLIENT_SECRET')} if present, MUST redirect to ${cli.colors.url('http://localhost')} using any port and path)`
  },
  subscriptionKey: {
    description: `Required to snapshot assignments. Blackbaud SKY API subscription access key (default: environment variable ${cli.colors.value('$SUBSCRIPTION_KEY')} if present)`
  },
  tokenPath: {
    description: `Path to JSON file storing saved tokens (default: ${cli.colors.quotedValue('"./var/tokens.json"')})`,
    default: './var/tokens.json'
  }
};
