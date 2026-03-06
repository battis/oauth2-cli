import { merge } from '../../src/URLSearchParams.js';

const query = new URLSearchParams({ foo: 'bar', argle: 'bargle' });

test('both undefined', () => {
  expect(merge(undefined, undefined)).toBe(undefined);
});

test('first undefined', () => {
  expect(merge(undefined, query)).toEqual(query);
  expect(merge(undefined, query)).toBe(query);
});

test('second undefined', () => {
  expect(merge(query, undefined)).toEqual(query);
  expect(merge(query, undefined)).toBe(query);
});

test('simple', () => {
  expect(merge({ foo: 'bar' }, { argle: 'bargle' })).toEqual(query);
  expect(merge({ argle: 'bargle' }, { foo: 'bar' })).toEqual(
    new URLSearchParams({ argle: 'bargle', foo: 'bar' })
  );
});

test('record and object', () => {
  const a = { foo: 'bar', argle: 123 };
  const b = new URLSearchParams({ baz: 'false', bar: 'bargle' });
  const c = new URLSearchParams({
    foo: 'bar',
    argle: '123',
    baz: 'false',
    bar: 'bargle'
  });
  const d = new URLSearchParams({
    baz: 'false',
    bar: 'bargle',
    foo: 'bar',
    argle: '123'
  });
  expect(merge(a, b)).toEqual(c);
  expect(merge(b, a)).toEqual(d);
});

test('repeats overwrite', () => {
  const a = { foo: 'bar', argle: 'bargle' };
  expect(merge(a, a)).toEqual(new URLSearchParams(a));
});
