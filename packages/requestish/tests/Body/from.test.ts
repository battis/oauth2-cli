import { from } from '../../src/Body.js';

test('Body', async () => {
  expect(await from(undefined)).toBeUndefined();
  expect(await from(null)).toBeNull();
  expect(await from('foo')).toEqual('foo');
  expect(await from(new ArrayBuffer(10))).toEqual(new ArrayBuffer(10));
  expect(await from((await fetch('https://example.com')).body)).toBeInstanceOf(
    ReadableStream
  );
  expect(await from(new Uint8Array())).toEqual(new Uint8Array());
  expect(await from(new URLSearchParams())).toEqual(new URLSearchParams());
});

test('URLSearchParams.ish', async () => {
  expect(
    await from({ a: 'A', b: 1, c: 3.14159, d: false, e: null, f: undefined })
  ).toEqual(
    new URLSearchParams({ a: 'A', b: '1', c: '3.14159', d: 'false', e: 'null' })
  );
  expect(
    await from([
      ['a', 1],
      ['a', 'foo'],
      ['a', undefined],
      ['a', null]
    ])
  ).toEqual(
    new URLSearchParams([
      ['a', '1'],
      ['a', 'foo'],
      ['a', ''],
      ['a', 'null']
    ])
  );
});

test('FetchBody', async () => {
  const form = new FormData();
  form.append('a', 'b');
  expect(await from(form)).toBeInstanceOf(ArrayBuffer);
});
