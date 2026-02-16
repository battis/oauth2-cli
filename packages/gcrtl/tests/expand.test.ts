import { expand } from '../src/index.js';

test('gcrtl url http with port', () => {
  expect(
    expand(
      '/original/path',
      'https://gcrtl.run.app/http/localhost:3000/foo/bar/baz'
    ).toString()
  ).toEqual('https://gcrtl.run.app/http/localhost:3000/original/path');
});
test('gcrtl url https with port', () => {
  expect(
    expand(
      '/original/path',
      'https://gcrtl.run.app/https/localhost:3000/foo/bar/baz'
    ).toString()
  ).toEqual('https://gcrtl.run.app/https/localhost:3000/original/path');
});
test('gcrtl url http without port', () => {
  expect(
    expand(
      '/original/path',
      'https://gcrtl.run.app/http/localhost/foo/bar/baz'
    ).toString()
  ).toEqual('https://gcrtl.run.app/http/localhost:80/original/path');
});
test('gcrtl url https without port', () => {
  expect(
    expand(
      '/original/path',
      'https://gcrtl.run.app/https/localhost/foo/bar/baz'
    ).toString()
  ).toEqual('https://gcrtl.run.app/https/localhost:443/original/path');
});
test('regular url http with port', () => {
  expect(
    expand(
      '/original/path',
      'http://www.example.com:8080/foo/bar/baz'
    ).toString()
  ).toEqual('http://www.example.com:8080/original/path');
});
test('regular url https with port', () => {
  expect(
    expand(
      '/original/path',
      'https://www.example.com:8080/foo/bar/baz'
    ).toString()
  ).toEqual('https://www.example.com:8080/original/path');
});
test('regular url http without port', () => {
  expect(
    expand('/original/path', 'http://www.example.com/foo/bar/baz').toString()
  ).toEqual('http://www.example.com/original/path');
});
test('regular url https without port', () => {
  expect(
    expand('/original/path', 'https://www.example.com/foo/bar/baz').toString()
  ).toEqual('https://www.example.com/original/path');
});
