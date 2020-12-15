import parseQuery from '../../src/utils/parse-query';

test('handles simple cases', () => {
  expect(parseQuery('?foo=bar')).toEqual({ foo: 'bar' });
  expect(parseQuery('foo=bar')).toEqual({ foo: 'bar' });
  expect(parseQuery('?foo=bar&bar=baz')).toEqual({ foo: 'bar', bar: 'baz' });
});

test('handles all unresolved characters', () => {
  // @see https://tools.ietf.org/html/rfc3986#section-2.3
  expect(parseQuery('?_f~o-o=bar')).toEqual({ '_f~o-o': 'bar' });
});

test('handles string with non-encoded hash', () => {
  expect(parseQuery('#')).toEqual({});
  expect(parseQuery('?#')).toEqual({});
  expect(parseQuery('#?')).toEqual({});

  expect(parseQuery('#foo=bar')).toEqual({});
  expect(parseQuery('?foo=bar#hash')).toEqual({ foo: 'bar' });
  expect(parseQuery('foo.b#ar=baz')).toEqual({ foo: { b: '' } });
});

test('handles nested objects', () => {
  expect(parseQuery('?foo.bar.baz=val')).toEqual({ foo: { bar: { baz: 'val' } } });
  expect(parseQuery('?foo.bar&foo.baz=val')).toEqual({ foo: { bar: '', baz: 'val' } });
  expect(parseQuery('?foo.bar.baz&foo.bar.zab=val')).toEqual({ foo: { bar: { baz: '', zab: 'val' } } });
});

test('handles empty values', () => {
  expect(parseQuery('?foo&bar&baz')).toEqual({ foo: '', bar: '', baz: '' });
  expect(parseQuery('?foo=&bar=&baz=')).toEqual({ foo: '', bar: '', baz: '' });
  expect(parseQuery('?foo&bar=&baz')).toEqual({ foo: '', bar: '', baz: '' });
  expect(parseQuery('?foo&bar&baz=')).toEqual({ foo: '', bar: '', baz: '' });
});

test('handles encoded values', () => {
  expect(parseQuery('?foo=%D0%B1%D0%B0%D1%80&bar=%D0%B1%D0%B0%D0%B7')).toEqual({ foo: 'бар', bar: 'баз' });
});

test('handles strings without query string', () => {
  expect(parseQuery('')).toEqual({});
  expect(parseQuery('#top')).toEqual({});
});

test('handles arrays', () => {
  expect(parseQuery('foo=bar&foo=baz')).toEqual({ foo: ['bar', 'baz'] });
  expect(parseQuery('?foo[]=bar')).toEqual({ foo: ['bar'] });
  expect(parseQuery('?foo[]=bar&foo[]=baz')).toEqual({ foo: ['bar', 'baz'] });
  expect(parseQuery('?foo[1]=bar&foo[3]=baz')).toEqual({ foo: [undefined, 'bar', undefined, 'baz'] });
});
