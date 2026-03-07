import { from } from '../../src/URL.js';
import { URLs } from '../data/URLs.js';

test('from', () => {
  URLs.forEach((url) => {
    expect(from(url)).toEqual(new URL(url));
    expect(from(new URL(url))).toEqual(new URL(url));
  });
});

test('Invalid URL', () => {
  expect(() => from('')).toThrow('Invalid URL');
  expect(() => from('relative/path/to/file.ext')).toThrow('Invalid URL');
  expect(() => from('/absolute/path/to/file.ext')).toThrow('Invalid URL');
});
