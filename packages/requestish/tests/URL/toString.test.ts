import { toString } from '../../src/URL.js';
import { URLs } from '../data/URLs.js';

test('toString', () => {
  URLs.forEach((url) => {
    expect(toString(url)).toEqual(url);
    expect(toString(new URL(url))).toEqual(url);
  });
});
