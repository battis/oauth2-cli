import { appendTo } from '../../src/URLSearchParams.js';
import { URLs } from '../data/URLs.js';

const results = [
  'https://example.com/?a=A&b=2&c=3.14159&d=false&f=%25%25-%25%25',
  'https://www.example.com/?a=A&b=2&c=3.14159&d=false&f=%25%25-%25%25',
  'https://www.example.com:3000/?a=A&b=2&c=3.14159&d=false&f=%25%25-%25%25',
  'https://example.com/path/to/endpoint?a=A&b=2&c=3.14159&d=false&f=%25%25-%25%25',
  'https://www.example.com:3000/path/to/endpoint#anchor?a=A&b=2&c=3.14159&d=false&f=%25%25-%25%25',
  'https://www.example.com:3000/path/to/endpoint#anchor?a=A&b=2&c=3.14159&d=false&f=%25%25-%25%25'
];

test('undefined URLSearchParams.ish', () => {
  URLs.forEach((url, i) => {
    expect(
      appendTo(url, {
        a: 'A',
        b: 2,
        c: 3.14159,
        d: false,
        e: undefined,
        f: '%%-%%'
      })
    ).toEqual(results[i]);
  });
  for (const url of URLs) {
    expect(appendTo(url, undefined)).toEqual(url);
    expect(appendTo(new URL(url), undefined)).toEqual(new URL(url));
  }
});

test('string', () => {
  for (const url of URLs) {
    expect(appendTo(url, { a: 1, b: 'a b c', d: '%%' }));
  }
});
