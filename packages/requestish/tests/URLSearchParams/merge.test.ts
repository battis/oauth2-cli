import { merge } from '../../src/URLSearchParams.js';

test('undefined', () => {
  expect(merge(undefined)).toBeUndefined();
  expect(merge(undefined, undefined)).toBeUndefined();
  expect(merge(undefined, undefined, undefined)).toBeUndefined();
  expect(merge({ a: 1 }, undefined)).toEqual(new URLSearchParams({ a: '1' }));
  expect(merge(undefined, { b: 2 })).toEqual(new URLSearchParams({ b: '2' }));
  expect(merge({ a: 3 }, undefined, { b: 4 })).toEqual(
    new URLSearchParams({ a: '3', b: '4' })
  );
  expect(merge({ a: 7 }, { b: 8 }, undefined)).toEqual(
    new URLSearchParams({ a: '7', b: '8' })
  );
});

test('overwrite', () => {
  expect(merge({ a: 1, b: 2 }, { b: 3, c: 4 }, { c: 5, d: 6 })).toEqual(
    new URLSearchParams({ a: '1', b: '3', c: '5', d: '6' })
  );
  expect(
    merge([
      ['a', 'A'],
      ['a', 'B']
    ])
  ).toEqual(new URLSearchParams({ a: 'B' }));
});

test('order', () => {
  expect(
    merge(
      [
        ['a', 'A'],
        ['b', 'B']
      ],
      [
        ['b', 'C'],
        ['b', 'D']
      ],
      [
        ['b', 'E'],
        ['c', 'F']
      ],
      [['a', 'G']]
    )
  ).toEqual(new URLSearchParams({ a: 'G', b: 'E', c: 'F' }));
  expect(merge({ a: 1, b: 2 }, { b: 3, a: 4 })).toEqual(
    new URLSearchParams({ a: '4', b: '3' })
  );
});
