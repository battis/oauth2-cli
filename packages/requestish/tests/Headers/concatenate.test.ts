import { concatenate } from '../../src/Headers.js';

test('undefined', () => {
  expect(concatenate(undefined)).toBeUndefined();
  expect(concatenate(undefined, undefined)).toBeUndefined();
  expect(concatenate(undefined, undefined, undefined)).toBeUndefined();
  expect(concatenate({ a: 1 }, undefined)).toEqual(new Headers({ a: '1' }));
  expect(concatenate(undefined, { a: 2 })).toEqual(new Headers({ a: '2' }));
  expect(concatenate(undefined, { a: 3 }, undefined)).toEqual(
    new Headers({ a: '3' })
  );
  expect(concatenate({ a: 4 }, undefined, { b: 5 })).toEqual(
    new Headers({ a: '4', b: '5' })
  );
});

test('order', () => {
  expect(concatenate({ a: 1, b: 2 })).toEqual(new Headers({ a: '1', b: '2' }));
  expect(
    concatenate([
      ['a', 'A'],
      ['a', 'B']
    ])
  ).toEqual(new Headers({ a: 'A, B' }));
  expect(concatenate({ a: 1, b: 2 }, { b: 3, c: 4 }, { c: 5, d: 6 })).toEqual(
    new Headers({ a: '1', b: '2, 3', c: '4, 5', d: '6' })
  );
  expect(
    concatenate(
      { a: 1, b: 2, c: 3 },
      [
        ['a', 'A'],
        ['b', 'B'],
        ['c', 'C']
      ],
      new Headers({ a: '#', b: '$', c: '%' })
    )
  ).toEqual(new Headers({ a: '1, A, #', b: '2, B, $', c: '3, C, %' }));
});
