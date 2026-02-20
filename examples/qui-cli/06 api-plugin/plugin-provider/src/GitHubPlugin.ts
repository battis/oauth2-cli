/**
 * Imported from the `extendable` namespace, avoiding the auto- registered
 * plugin instance in the default export
 */
import { OAuth2Plugin, Token } from '@oauth2-cli/qui-cli/extendable';
import { Colors } from '@qui-cli/colors';

export class GitHubPlugin extends OAuth2Plugin {
  public constructor() {
    // set the (globally unique) name of the plugin
    super('GitHub');

    // configure API-specific options
    this.configure({
      credentials: {
        authorization_endpoint: 'https://github.com/login/oauth/authorize',
        token_endpoint: 'https://github.com/login/oauth/access_token'
      },
      base_url: 'https://api.github.com',
      man: {
        heading: 'GitHub options',
        text: [
          `The GitHub API ${Colors.keyword('refresh_token')} is stored in the ` +
            `environment variable ${Colors.varName('GITHUB_REFRESH_TOKEN')}, ` +
            `if present.`
        ]
      },
      env: {
        client_id: 'GITHUB_CLIENT_ID',
        client_secret: 'GITHUB_CLIENT_SECRET',
        redirect_uri: 'GITHUB_REDIRECT_URI'
      },
      suppress: {
        issuer: true,
        base_url: true,
        authorization_endpoint: true,
        token_endpoint: true
      },
      storage: new Token.EnvironmentStorage('GITHUB_REFRESH_TOKEN')
    });
  }
}
