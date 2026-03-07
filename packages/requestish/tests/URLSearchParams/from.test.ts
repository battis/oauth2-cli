import { from } from '../../src/URLSearchParams.js';

test('URLSearchParams', () => {
  expect(from(new URLSearchParams({ a: 'A', b: 'B' }))).toEqual(
    new URLSearchParams(new URLSearchParams({ a: 'A', b: 'B' }))
  );
  expect(from({ a: 'A', b: 'B' })).toEqual(
    new URLSearchParams({ a: 'A', b: 'B' })
  );
  expect(
    from([
      ['a', 'A'],
      ['b', 'B']
    ])
  ).toEqual(
    new URLSearchParams([
      ['a', 'A'],
      ['b', 'B']
    ])
  );
  expect(from(undefined)).toEqual(new URLSearchParams(undefined));
});

test('Record', () => {
  expect(from({ a: 'A', b: 'B' })).toEqual(
    new URLSearchParams({ a: 'A', b: 'B' })
  );
  expect(from({ a: 1, b: 2 })).toEqual(new URLSearchParams({ a: '1', b: '2' }));
  expect(from({ a: 3.14159, b: 1.618 })).toEqual(
    new URLSearchParams({ a: '3.14159', b: '1.618' })
  );
  expect(from({ a: true, b: false })).toEqual(
    new URLSearchParams({ a: 'true', b: 'false' })
  );
  expect(from({ a: null, b: null })).toEqual(
    new URLSearchParams({ a: 'null', b: 'null' })
  );
  expect(from({ a: 'A', b: 123, c: 3.14159, d: true, e: null })).toEqual(
    new URLSearchParams({
      a: 'A',
      b: '123',
      c: '3.14159',
      d: 'true',
      e: 'null'
    })
  );
});

test('Entries', () => {
  expect(
    from([
      ['a', 'A'],
      ['a', 'B'],
      ['b', undefined],
      ['c', null]
    ])
  ).toEqual(
    new URLSearchParams([
      ['a', 'A'],
      ['a', 'B'],
      ['b', ''],
      ['c', 'null']
    ])
  );
  expect(
    from([
      ['a', 'A'],
      ['b', 1],
      ['c', 3.14159],
      ['d', true],
      ['e', false],
      ['f', null],
      ['g', '']
    ])
  ).toEqual(
    new URLSearchParams([
      ['a', 'A'],
      ['b', '1'],
      ['c', '3.14159'],
      ['d', 'true'],
      ['e', 'false'],
      ['f', 'null'],
      ['g', '']
    ])
  );
});

test('nullish', () => {
  expect(from({ a: null, b: undefined, c: '' })).toEqual(
    new URLSearchParams({ a: 'null', c: '' })
  );
});
