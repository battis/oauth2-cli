import { Canvas } from '@oauth2-cli/canvas';
import { SkyAPI } from '@oauth2-cli/sky-api';
import { Core } from '@qui-cli/core';
import { Log } from '@qui-cli/log';
import { Root } from '@qui-cli/root';
import path from 'node:path';

Root.configure({ root: path.dirname(import.meta.dirname) });
await Core.run();

const sky = new SkyAPI({
  client_id: process.env.SKY_CLIENT_ID!,
  client_secret: process.env.SKY_CLIENT_SECRET!,
  subscription_key: process.env.SKY_SUBSCRIPTION_KEY!,
  redirect_uri: process.env.SKY_REDIRECT_URI!,
  store: './var/sky-api.json'
});

const canvas = new Canvas({
  instance_url: process.env.CANVAS_INSTANCE_URL!,
  client_id: process.env.CANVAS_CLIENT_ID!,
  client_secret: process.env.CANVAS_CLIENT_SECRET!,
  redirect_uri: process.env.CANVAS_REDIRECT_URI!,
  store: './var/canvas.json'
});

Log.info((await canvas.fetch('/api/v1/users/self')) || 'no Canvas response');
Log.info((await sky.fetch('school/v1/users/me')) || 'no SKY API response');
