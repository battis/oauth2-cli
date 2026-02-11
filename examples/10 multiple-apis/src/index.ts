import { OAuth2Plugin } from '@oauth2-cli/qui-cli/dist/OAuth2Plugin.js';
import { Core } from '@qui-cli/core';
import { Env } from '@qui-cli/env';
import { Log } from '@qui-cli/log';
import { register } from '@qui-cli/plugin';
import { Root } from '@qui-cli/root';

// only necessary because we're in a monorepo and qui-cli _really_ wants to be at the root of it!
Root.configure({ root: process.cwd() });

const canvas = new OAuth2Plugin('canvas');
const sky = new OAuth2Plugin('sky');

await register(canvas);
await register(sky);

canvas.configure({
  man: { heading: 'Canvas LMS API options' },
  opt: {
    issuer: 'canvasIssuer',
    client_id: 'canvasClientId',
    client_secret: 'canvasClientSecret',
    redirect_uri: 'canvasRedirectUri',
    scope: 'canvasScope'
  },
  env: {
    issuer: 'CANVAS_ISSUER',
    client_id: 'CANVAS_CLIENT_ID',
    client_secret: 'CANVAS_CLIENT_SECRET',
    redirect_uri: 'CANVAS_REDIRECT_URI',
    scope: 'CANVAS_SCOPE'
  },
  suppress: {
    authorization_endpoint: true,
    token_endpoint: true
  }
});

sky.configure({
  credentials: {
    authorization_endpoint: 'https://app.blackbaud.com/oauth/authorize',
    token_endpoint: 'https://oauth2.sky.blackbaud.com/token'
  },
  inject: {
    headers: {
      'Bb-Api-Subscription-Key': await Env.get({ key: 'SKY_SUBSCRIPTION_KEY' })
    }
  },
  man: { heading: 'Sky API options' },
  opt: {
    client_id: 'skyClientId',
    client_secret: 'skyClientSecret',
    redirect_uri: 'skyRedirectUri'
  },
  env: {
    client_id: 'SKY_CLIENT_ID',
    client_secret: 'SKY_CLIENT_SECRET',
    redirect_uri: 'SKY_REDIRECT_URI'
  },
  suppress: {
    authorization_endpoint: true,
    token_endpoint: true
  }
});

await Core.run();
Log.info({
  canvas: {
    profile: await canvas.requestJSON('/api/v1/users/self/profile')
  },
  sky: {
    me: await sky.requestJSON(
      'https://api.sky.blackbaud.com/school/v1/users/me'
    )
  }
});
