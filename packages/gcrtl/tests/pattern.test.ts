import { pattern } from '../src/index.js';

test('test gcrtl path', () => {
  expect(pattern.test('/http/localhost:3000/foo/bar/baz')).toBeTruthy();
});
test('test regular path', () => {
  expect(pattern.test('/foo/bar/baz')).toBeFalsy();
});
test('match gcrtl path', () => {
  expect(
    JSON.stringify('/http/localhost:3000/foo/bar/baz'.match(pattern))
  ).toEqual(
    JSON.stringify([
      '/http/localhost:3000/foo/bar/baz',
      'http',
      'localhost:3000',
      'localhost',
      ':3000',
      '3000',
      '/foo/bar/baz'
    ])
  );
});
test('match regular path', () => {
  expect('/foo/bar/baz'.match(pattern)).toBeNull();
});
test('match gcrtl path without port', () => {
  expect(JSON.stringify('/https/localhost/foo/bar/baz'.match(pattern))).toEqual(
    JSON.stringify([
      '/https/localhost/foo/bar/baz',
      'https',
      'localhost',
      'localhost',
      null,
      null,
      '/foo/bar/baz'
    ])
  );
});
