import { describe, it } from 'node:test';
import assert from 'node:assert';
import { combineQueryCasts, queryCast, Types } from '../dist/index.js';

const cast1 = queryCast({
  foo: Types.FLOAT,
  bar: Types.BOOLEAN,
  baz: Types.STRING
});
const cast2 = queryCast({
  fooFoo: Types.FLOAT,
  barBar: Types.BOOLEAN,
  bazBaz: Types.STRING
});

describe('queryCast', () => {
  it('should parse and cast query string in a simple case', () => {
    assert.deepEqual(cast1('?foo=12.15&bar=false&baz=baaaz'), {
      foo: 12.15,
      bar: false,
      baz: 'baaaz'
    });
  });

  it('should support bracket-type format of arrays', () => {
    const cast = queryCast({ foo: [Types.NUMBER] });

    assert.deepEqual(cast('?foo[]=1&foo[]=2&foo[]=3'), {
      foo: [1, 2, 3]
    });
  });

  it('should support index-type format of arrays', () => {
    const cast = queryCast({ foo: [Types.NUMBER] });

    assert.deepEqual(cast('?foo[0]=1&foo[1]=2&foo[2]=3'), {
      foo: [1, 2, 3]
    });
  });

  it('should support array based on key duplication', () => {
    const cast = queryCast({ foo: [Types.NUMBER] });

    assert.deepEqual(cast('?foo=1&foo=2&foo=3'), {
      foo: [1, 2, 3]
    });

    const castDefault = queryCast({ foo: [Types.NUMBER] });

    assert.deepEqual(castDefault('?foo=1&foo=2&foo=3'), {
      foo: [1, 2, 3]
    });
  });

  it('should skip params which were not in query-string', () => {
    assert.deepEqual(cast1('?foo=12.15&baz=baaaz'), {
      foo: 12.15,
      baz: 'baaaz'
    });
  });

  it('should support object as param of the cast function', () => {
    assert.deepEqual(
      cast1({
        foo: '12.15',
        bar: 'false',
        baz: 'baaaz'
      }),
      {
        foo: 12.15,
        bar: false,
        baz: 'baaaz'
      }
    );
  });

  it('handles simple cases', () => {
    const cast = queryCast({ foo: Types.STRING, bar: Types.STRING });
    assert.deepEqual(cast('?foo=bar'), { foo: 'bar' });
    assert.deepEqual(cast('foo=bar'), { foo: 'bar' });
    assert.deepEqual(cast('?foo=bar&bar=baz'), { foo: 'bar', bar: 'baz' });
  });

  it('handles all unreserved characters', () => {
    const cast = queryCast({ '_f~o-o': Types.STRING });
    assert.deepEqual(cast('?_f~o-o=bar'), { '_f~o-o': 'bar' });
  });

  it('handles string with non-encoded hash', () => {
    const cast = queryCast({ foo: Types.STRING });
    assert.deepEqual(cast('#'), {});
    assert.deepEqual(cast('?#'), {});
    assert.deepEqual(cast('#?'), {});
    assert.deepEqual(cast('#foo=bar'), {});
    assert.deepEqual(cast('?foo=bar#hash'), { foo: 'bar' });
  });

  it('handles nested objects', () => {
    const cast = queryCast({ foo: Types.ANY });
    assert.deepEqual(cast('?foo.bar.baz=val'), { foo: { bar: { baz: 'val' } } });

    const castMulti = queryCast({ foo: Types.ANY, baz: Types.ANY });
    assert.deepEqual(castMulti('?foo.bar&foo.baz=val'), { foo: { bar: '', baz: 'val' } });
    assert.deepEqual(
      castMulti('?foo.bar.baz&foo.bar.zab=val'),
      { foo: { bar: { baz: '', zab: 'val' } } }
    );
  });

  it('handles empty values', () => {
    const cast = queryCast({ foo: Types.STRING, bar: Types.STRING, baz: Types.STRING });
    assert.deepEqual(cast('?foo&bar&baz'), { foo: '', bar: '', baz: '' });
    assert.deepEqual(cast('?foo=&bar=&baz='), { foo: '', bar: '', baz: '' });
    assert.deepEqual(cast('?foo&bar=&baz'), { foo: '', bar: '', baz: '' });
    assert.deepEqual(cast('?foo&bar&baz='), { foo: '', bar: '', baz: '' });
  });

  it('handles encoded values', () => {
    const cast = queryCast({ foo: Types.STRING, bar: Types.STRING });
    assert.deepEqual(
      cast('?foo=%D0%B1%D0%B0%D1%80&bar=%D0%B1%D0%B0%D0%B7'),
      { foo: 'бар', bar: 'баз' }
    );
  });

  it('handles strings without query string', () => {
    const cast = queryCast({ foo: Types.STRING });
    assert.deepEqual(cast(''), {});
    assert.deepEqual(cast('#top'), {});
  });

  it('handles arrays', () => {
    const cast = queryCast({ foo: [Types.STRING] });
    assert.deepEqual(cast('foo=bar&foo=baz'), { foo: ['bar', 'baz'] });
    assert.deepEqual(cast('?foo[]=bar'), { foo: ['bar'] });
    assert.deepEqual(cast('?foo[]=bar&foo[]=baz'), { foo: ['bar', 'baz'] });
    const sparse = [];
    sparse[1] = 'bar';
    sparse[3] = 'baz';
    assert.deepEqual(cast('?foo[1]=bar&foo[3]=baz'), { foo: sparse });
  });

  it('handles empty params with trailing ampersand', () => {
    const cast = queryCast({ foo: Types.STRING, bar: Types.STRING });
    assert.deepEqual(cast('foo&bar=baz'), { foo: '', bar: 'baz' });

    const edgeCast = queryCast({ a: Types.STRING, c: Types.STRING, d: Types.STRING });
    assert.deepEqual(edgeCast('a=b&c&d=e'), { a: 'b', c: '', d: 'e' });
    assert.deepEqual(edgeCast('a=b&c=&d=e'), { a: 'b', c: '', d: 'e' });
  });

  it('handles leading and trailing ampersands', () => {
    const cast = queryCast({ foo: Types.STRING });
    assert.deepEqual(cast('&&foo=bar&&'), { foo: 'bar' });
    assert.deepEqual(cast('&'), {});
    assert.deepEqual(cast('&&&&'), {});
  });

  it('handles duplicate keys with empty values', () => {
    const cast = queryCast({ a: [Types.STRING] });
    assert.deepEqual(cast('a&a&'), { a: ['', ''] });
    assert.deepEqual(cast('a&a&a&'), { a: ['', '', ''] });
    assert.deepEqual(cast('a=&a=value&a='), { a: ['', 'value', ''] });
  });

  it('handles params with only ampersands', () => {
    const cast = queryCast({ a: Types.STRING, b: Types.STRING });
    assert.deepEqual(cast('a&&b'), { a: '', b: '' });
    assert.deepEqual(cast('a=a&&b=b'), { a: 'a', b: 'b' });
    assert.deepEqual(cast('&a'), { a: '' });
  });

  it('skips params with empty keys', () => {
    const cast = queryCast({ a: Types.STRING, d: Types.STRING, c: Types.STRING });
    assert.deepEqual(cast('a=b&=c&d=e'), { a: 'b', d: 'e' });
    assert.deepEqual(cast('a=b&=&c=d'), { a: 'b', c: 'd' });
    assert.deepEqual(cast('='), {});
    assert.deepEqual(cast('&='), {});
  });
});

describe('combineQueryCasts', () => {
  it('should support combination of query-casts', () => {
    const combinedCast = combineQueryCasts({
      cast1,
      cast2
    });

    assert.deepEqual(
      combinedCast('?foo=12.15&bar=false&baz=baaaz&fooFoo=98.76&barBar=true&bazBaz=zaaab'),
      {
        cast1: {
          foo: 12.15,
          bar: false,
          baz: 'baaaz'
        },
        cast2: {
          fooFoo: 98.76,
          barBar: true,
          bazBaz: 'zaaab'
        }
      }
    );
  });
});
