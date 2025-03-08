# @oauth2-cli/sky-api

Acquire SKY API access tokens via OAuth 2.0 within CLI tools

## Install

```sh
npm i @oauth2-cli/sky-api
```

## Usage

Configure your SKY API app credentials somewhere relatively secure (e.g. your environment) and then...

```ts
import dotenv from 'dotenv';
import { SkyAPI } from '@oauth2-cli/sky-api';

(async () => {
  dotenv.config();
  const sky = new SkyAPI({
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    subscription_key: process.env.SUBSCRIPTION_KEY,
    redirect_uri: process.env.REDIRECT_URI
  });
  const calendar = await sky.fetch('school/v1/events/calendar');
})();
```
