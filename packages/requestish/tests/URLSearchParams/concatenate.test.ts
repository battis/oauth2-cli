import { concatenate } from '../../src/URLSearchParams.js';

test('undefined', () => {
  expect(concatenate(undefined)).toBeUndefined();
  expect(concatenate(undefined, undefined)).toBeUndefined();
  expect(concatenate(undefined, undefined, undefined)).toBeUndefined();
  expect(concatenate(undefined, { a: 1, b: 2 })).toEqual(
    new URLSearchParams({ a: '1', b: '2' })
  );
  expect(concatenate({ a: 3, b: 4 }, undefined)).toEqual(
    new URLSearchParams({ a: '3', b: '4' })
  );
  expect(concatenate({ a: 5, b: 6 }, undefined, { c: 7, d: 8 })).toEqual(
    new URLSearchParams({ a: '5', b: '6', c: '7', d: '8' })
  );
  expect(
    concatenate([
      ['a', 1],
      ['a', undefined],
      ['b', 2]
    ])
  ).toEqual(
    new URLSearchParams([
      ['a', '1'],
      ['a', ''],
      ['b', '2']
    ])
  );
});
expect(
  concatenate(
    undefined,
    [
      ['a', 'A'],
      ['b', 'B']
    ],
    undefined,
    [
      ['a', 'C'],
      ['b', 'D']
    ]
  )
).toEqual(
  new URLSearchParams([
    ['a', 'A'],
    ['b', 'B'],
    ['a', 'C'],
    ['b', 'D']
  ])
);

test('ordering', () => {
  expect(concatenate({ a: 1, b: undefined, c: 'foo' })).toEqual(
    new URLSearchParams({ a: '1', c: 'foo' })
  );
  expect(
    concatenate([
      ['a', 1],
      ['b', undefined],
      ['c', 'foo']
    ])
  ).toEqual(new URLSearchParams({ a: '1', b: '', c: 'foo' }));
  expect(concatenate({ a: 1, b: 2 }, { b: 3, c: 4 }, { c: 5, d: 6 })).toEqual(
    new URLSearchParams([
      ['a', '1'],
      ['b', '2'],
      ['b', '3'],
      ['c', '4'],
      ['c', '5'],
      ['d', '6']
    ])
  );
});
