import { from } from '../../src/String.js';

test('JSON', () => {
  expect(from('a')).toEqual('a');
  expect(from(1)).toEqual('1');
  expect(from(3.14159)).toEqual('3.14159');
  expect(from(true)).toEqual('true');
  expect(from(false)).toEqual('false');
  expect(from(undefined)).toEqual('');
  expect(from(null)).toEqual('null');
});
