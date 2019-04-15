import { combineQueryCasts, queryCast, Types } from '../src/index';

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

test('should parse and cast query string in a simple case', () => {
  expect(cast1('?foo=12.15&bar=false&baz=baaaz')).toEqual({
    foo: 12.15,
    bar: false,
    baz: 'baaaz'
  });
});

test('should support combination of query-cast\'s', () => {
  const combinedCast = combineQueryCasts({
    cast1,
    cast2
  });

  expect(
    combinedCast(
      '?foo=12.15&bar=false&baz=baaaz&fooFoo=98.76&barBar=true&bazBaz=zaaab'
    )
  ).toEqual({
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
  });
});
