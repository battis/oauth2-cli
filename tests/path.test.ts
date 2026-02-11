import { path } from '../src/index.js';

test('gcrtl url path', () => {
  expect(
    path('https://gcrtl.run.app/https/localhost:3000/foo/bar/baz')
  ).toEqual('/foo/bar/baz');
});
test('regular url path', () => {
  expect(path('https://www.example.com:8080/foo/bar/baz')).toBe('/foo/bar/baz');
});
