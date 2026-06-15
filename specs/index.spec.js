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
