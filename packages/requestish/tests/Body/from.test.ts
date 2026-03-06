import { from } from '../../src/Body.js';

test('from Record<string,string>', async () => {
  expect(await from({ foo: 'bar', argle: 'bargle' })).toEqual(
    new URLSearchParams({ foo: 'bar', argle: 'bargle' })
  );
});

test('from Record<string,JSONPrimitive>', async () => {
  expect(
    await from({
      foo: 'bar',
      argle: 'bargle',
      baz: 123,
      boop: false
    })
  ).toEqual(
    new URLSearchParams({
      foo: 'bar',
      argle: 'bargle',
      baz: '123',
      boop: 'false'
    })
  );
});
