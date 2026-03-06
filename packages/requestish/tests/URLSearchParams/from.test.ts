import { from } from '../../src/URLSearchParams.js';

const query = new URLSearchParams({ foo: 'bar', argle: 'bargle' });

test('from URLSearchParams', () => {
  expect(from(query)).toBe(query);
  expect(from(query)).toEqual(query);
});

test('from Record<string,string>', () => {
  expect(from({ foo: 'bar', argle: 'bargle' })).toEqual(query);
});

test('from Record<string,JSONPrimitive>', () => {
  expect(from({ foo: 'bar', argle: 'bargle', baz: 123, boop: false })).toEqual(
    new URLSearchParams({
      foo: 'bar',
      argle: 'bargle',
      baz: '123',
      boop: 'false'
    })
  );
});
