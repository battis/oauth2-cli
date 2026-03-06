import { toString } from '../../src/URLSearchParams.js';

test('empty', () => {
  expect(toString(new URLSearchParams())).toEqual('');
});

test('unencoded', () => {
  expect(toString({ foo: 'bar', argle: 'bargle' })).toEqual(
    '?foo=bar&argle=bargle'
  );
});

test('encoded', () => {
  expect(toString({ foo: 'argle bargle', bar: '&baz' })).toEqual(
    '?foo=argle+bargle&bar=%26baz'
  );
});

test('multiples', () => {
  const query = new URLSearchParams();
  query.append('foo', 'bar');
  query.append('foo', 'baz');
  expect(toString(query)).toEqual('?foo=bar&foo=baz');
});
