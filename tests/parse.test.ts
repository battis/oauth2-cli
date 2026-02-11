import { hostname } from 'node:os';
import { parse } from '../src/index.js';

test('parse gcrtl url', () => {
  expect(
    parse('https://gcrtl.run.app/http/localhost:3000/foo/bar/baz')
  ).toEqual({
    url: new URL('https://gcrtl.run.app/http/localhost:3000/foo/bar/baz'),
    protocol: 'http',
    hostname: 'localhost',
    port: '3000',
    path: '/foo/bar/baz'
  });
});
test('parse regular url', () => {
  expect(parse('http://localhost:3000/foo/bar/baz')).toEqual({
    url: new URL('http://localhost:3000/foo/bar/baz'),
    protocol: undefined,
    hostname: undefined,
    port: undefined,
    path: undefined
  });
});
