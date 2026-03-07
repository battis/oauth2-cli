import { from } from '../../src/Headers.js';

test('from', () => {
  expect(from(undefined)).toEqual(new Headers());
  expect(from({ foo: 'bar' })).toEqual(new Headers({ foo: 'bar' }));
  expect(from([['foo', 'bar']])).toEqual(new Headers([['foo', 'bar']]));
  expect(from(new Headers())).toEqual(new Headers());
  expect(
    from({ a: 'A', b: 1, c: 3.14159, d: true, e: false, f: undefined, g: null })
  ).toEqual(
    new Headers({
      a: 'A',
      b: '1',
      c: '3.14159',
      d: 'true',
      e: 'false',
      g: 'null'
    })
  );
  expect(
    from([
      ['a', 1],
      ['b', 3.14159],
      ['c', true],
      ['d', false],
      ['e', undefined],
      ['f', null],
      ['g', 'G']
    ])
  ).toEqual(
    new Headers([
      ['a', '1'],
      ['b', '3.14159'],
      ['c', 'true'],
      ['d', 'false'],
      ['e', ''],
      ['f', 'null'],
      ['g', 'G']
    ])
  );
  expect(
    from([
      ['a', 'A'],
      ['a', 'B']
    ])
  ).toEqual(
    new Headers([
      ['a', 'A'],
      ['a', 'B']
    ])
  );
});
