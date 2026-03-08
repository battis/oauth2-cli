import { toString } from '../../src/URLSearchParams.js';

test('empty', () => {
  expect(toString(new URLSearchParams())).toEqual('');
});

test('unencoded', () => {
  expect(toString({ a: 1, b: 2 })).toEqual('?a=1&b=2');
});

test('encoded', () => {
  expect(toString({ a: '1 2 3', b: '&4' })).toEqual('?a=1+2+3&b=%264');
});

test('multiples', () => {
  expect(
    toString([
      ['a', 'A'],
      ['a', 'B']
    ])
  ).toEqual('?a=A&a=B');
});

test('ish', () => {
  expect(toString({ a: 1, b: 2 })).toEqual('?a=1&b=2');
  expect(toString({ a: 1, b: undefined, c: 3 })).toEqual('?a=1&c=3');
  expect(
    toString([
      ['a', 'A'],
      ['a', 'B']
    ])
  ).toEqual('?a=A&a=B');
  expect(
    toString([
      ['a', 1],
      ['b', undefined]
    ])
  ).toEqual('?a=1&b=');
});
