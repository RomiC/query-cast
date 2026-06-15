import { describe, it } from 'node:test';
import assert from 'node:assert';
import { parseQuery } from '../../dist/index.js';

describe('parseQuery', () => {
  it('handles simple cases', () => {
    assert.deepEqual(parseQuery('?foo=bar'), { foo: 'bar' });
    assert.deepEqual(parseQuery('foo=bar'), { foo: 'bar' });
    assert.deepEqual(parseQuery('?foo=bar&bar=baz'), { foo: 'bar', bar: 'baz' });
  });

  it('handles all unresolved characters', () => {
    // @see https://tools.ietf.org/html/rfc3986#section-2.3
    assert.deepEqual(parseQuery('?_f~o-o=bar'), { '_f~o-o': 'bar' });
  });

  it('handles string with non-encoded hash', () => {
    assert.deepEqual(parseQuery('#'), {});
    assert.deepEqual(parseQuery('?#'), {});
    assert.deepEqual(parseQuery('#?'), {});

    assert.deepEqual(parseQuery('#foo=bar'), {});
    assert.deepEqual(parseQuery('?foo=bar#hash'), { foo: 'bar' });
    assert.deepEqual(parseQuery('foo.b#ar=baz'), { foo: { b: '' } });
  });

  it('handles nested objects', () => {
    assert.deepEqual(parseQuery('?foo.bar.baz=val'), { foo: { bar: { baz: 'val' } } });
    assert.deepEqual(parseQuery('?foo.bar&foo.baz=val'), { foo: { bar: '', baz: 'val' } });
    assert.deepEqual(parseQuery('?foo.bar.baz&foo.bar.zab=val'), { foo: { bar: { baz: '', zab: 'val' } } });
  });

  it('handles empty values', () => {
    assert.deepEqual(parseQuery('?foo&bar&baz'), { foo: '', bar: '', baz: '' });
    assert.deepEqual(parseQuery('?foo=&bar=&baz='), { foo: '', bar: '', baz: '' });
    assert.deepEqual(parseQuery('?foo&bar=&baz'), { foo: '', bar: '', baz: '' });
    assert.deepEqual(parseQuery('?foo&bar&baz='), { foo: '', bar: '', baz: '' });
  });

  it('handles encoded values', () => {
    assert.deepEqual(parseQuery('?foo=%D0%B1%D0%B0%D1%80&bar=%D0%B1%D0%B0%D0%B7'), { foo: 'бар', bar: 'баз' });
  });

  it('handles strings without query string', () => {
    assert.deepEqual(parseQuery(''), {});
    assert.deepEqual(parseQuery('#top'), {});
  });

  it('handles arrays', () => {
    assert.deepEqual(parseQuery('foo=bar&foo=baz'), { foo: ['bar', 'baz'] });
    assert.deepEqual(parseQuery('?foo[]=bar'), { foo: ['bar'] });
    assert.deepEqual(parseQuery('?foo[]=bar&foo[]=baz'), { foo: ['bar', 'baz'] });
    const sparseArray = [];
    sparseArray[1] = 'bar';
    sparseArray[3] = 'baz';
    assert.deepEqual(parseQuery('?foo[1]=bar&foo[3]=baz'), { foo: sparseArray });
  });
});
