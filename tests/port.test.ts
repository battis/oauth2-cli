import { port } from '../src/index.js';

test('test gcrtl url https without port', () => {
  expect(port('https://gcrtl.run.app/https/localhost/foo/bar/baz')).toEqual(
    443
  );
});
test('test gcrtl url http without port', () => {
  expect(port('https://gcrtl.run.app/http/localhost/foo/bar/baz')).toEqual(80);
});
test('test gcrtl https with port', () => {
  expect(
    port('https://grctl.run.app/https/localhost:3000/foo/bar/baz')
  ).toEqual(3000);
});
test('test gcrtl http with port', () => {
  expect(port('https://grctl.run.app/http/localhost:8080/foo/bar/baz')).toEqual(
    8080
  );
});
test('regular url https without port', () => {
  expect(port('https://www.example.com/foo/bar/baz')).toBe(443);
});
test('regular url http without port', () => {
  expect(port('http://www.example/com/foo/bar/baz')).toBe(80);
});
test('regular url https with port', () => {
  expect(port('https://www.example.com:1337/foo/bar/baz')).toBe(1337);
});
test('regular url http with port', () => {
  expect(port('http://www.example.com:4000/foo/bar/baz')).toBe(4000);
});
