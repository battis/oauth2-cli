import { merge } from '../../src/Headers.js';

test('undefined', () => {
  expect(merge(undefined)).toBeUndefined();
  expect(merge(undefined, undefined)).toBeUndefined();
  expect(merge(undefined, undefined, undefined)).toBeUndefined();
  expect(merge(undefined, { a: 1 })).toEqual(new Headers({ a: '1' }));
  expect(merge({ a: 2 }, undefined)).toEqual(new Headers({ a: '2' }));
  expect(merge(undefined, { a: 3 }, undefined)).toEqual(
    new Headers({ a: '3' })
  );
  expect(merge({ a: 4 }, undefined, { b: 5 })).toEqual(
    new Headers({ a: '4', b: '5' })
  );
});

test('order', () => {
  expect(
    Object.fromEntries(
      merge([
        ['a', 'A'],
        ['a', 'B']
      ])!.entries()
    )
  ).toEqual(Object.fromEntries(new Headers({ a: 'B' }).entries()));
  expect(merge({ a: 1, b: 2 }, { b: 3, c: 4 }, { c: 5, d: 6 })).toEqual(
    new Headers({ a: '1', b: '3', c: '5', d: '6' })
  );
});
