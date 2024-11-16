import cli from '@battis/qui-cli';
import * as OAuth2 from '../OAuth2.js';

const REDIRECT_URI = 'http://localhost:3000';

export const args = {
  options: {
    clientId: {
      short: 'i',
      description: `OAuth 2.0 client ID (defaults to ${cli.colors.value('$CLIENT_ID')} environment variable, if present)`
    },
    clientSecret: {
      short: 's',
      description: `OAuth 2.0 client secret (defaults to ${cli.colors.value('$CLIENT_SECRET')} environment variable, if present)`
    },
    redirectUri: {
      short: 'r',
      description: `OAuth 2.0 redirect URI (defaults to ${cli.colors.value('$REDIRECT_URI')} environment variable, if present, or ${cli.colors.quotedValue(`"${REDIRECT_URI}"`)} if undefined)`
    },
    authorizationUrl: {
      short: 'a'
    },
    tokenUrl: {
      short: 't'
    },
    requestFormat: {
      short: 'f',
      description: `MIME-type of body when sending POST request for access token (default: ${cli.colors.quotedValue('"application/x-www-form-url-encoded"')}, ${cli.colors.quotedValue(
        '"application/json"'
      )} also supported)`,
      default: 'application/x-www-form-urlencoded'
    },
    tokenPath: {
      short: 'p',
      description: `Path to store/retrieve access tokens (Optional)`
    }
  },
  optList: {
    headers: {
      short: 'H',
      description: `Additional headers to include in requests to API server (use colon-separated format: ${cli.colors.quotedValue('"ExampleHeader:example-header-value"')}).`
    }
  }
};

type Parsed = {
  credentials: OAuth2.Credentials;
  options: OAuth2.Options;
  tokenPath?: string;
};

export function parse(values: Record<string, any>): Parsed {
  const {
    clientId: client_id = process.env.CLIENT_ID,
    clientSecret: client_secret = process.env.CLIENT_SECRET,
    redirectUri: redirect_uri = process.env.REDIRECT_URI || REDIRECT_URI,
    authorizationUrl,
    tokenUrl,
    headers = [],
    requestFormat,
    tokenPath
  } = values;
  if (!client_id) {
    throw new Error(
      `${cli.colors.value('clientId')} option or ${cli.colors.value('$CLIENT_ID')} environment variable must be defined.`
    );
  }
  if (!client_secret) {
    throw new Error(
      `${cli.colors.value('clientSecret')} option or ${cli.colors.value('$CLIENT_SECRET')} environment variable must be defined.`
    );
  }
  return {
    credentials: {
      client_id,
      client_secret,
      redirect_uri
    },
    options: {
      authorizationUrl,
      tokenUrl,
      headers: headers.reduce((all: Record<string, string>, raw: string) => {
        const [, header, value] =
          raw.match(/^([^:]+):(.*)$/)?.map((part) => part.trim()) || [];
        if (header && value) {
          all[header] = value;
        } else {
          throw new Error(
            `Could not parse header value ${cli.colors.quotedValue(`"${raw}"`)} (expected ${cli.colors.quotedValue('"Header:value"')} format).`
          );
        }
        return all;
      }, {}),
      requestFormat,
      tokenPath
    }
  };
}
