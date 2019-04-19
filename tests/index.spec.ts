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

test('should support bracket-type format of arrays', () => {
  const cast = queryCast({ foo: [Types.NUMBER] }, { arrayFormat: 'bracket' });

  expect(cast('?foo[]=1&foo[]=2&foo[]=3')).toEqual({
    foo: [1, 2, 3]
  });
});

test('should support index-type format of arrays', () => {
  const cast = queryCast({ foo: [Types.NUMBER] }, { arrayFormat: 'index' });

  expect(cast('?foo[0]=1&foo[1]=2&foo[2]=3')).toEqual({
    foo: [1, 2, 3]
  });
});

test('should support comma-type format of arrays', () => {
  const cast = queryCast({ foo: [Types.NUMBER] }, { arrayFormat: 'comma' });

  expect(cast('?foo=1,2,3')).toEqual({
    foo: [1, 2, 3]
  });
});

test('should support array based on key duplication', () => {
  const cast = queryCast({ foo: [Types.NUMBER] }, { arrayFormat: 'none' });

  expect(cast('?foo=1&foo=2&foo=3')).toEqual({
    foo: [1, 2, 3]
  });

  const castDefault = queryCast({ foo: [Types.NUMBER] });

  expect(castDefault('?foo=1&foo=2&foo=3')).toEqual({
    foo: [1, 2, 3]
  });
});

test('should support object as param of the cast function', () => {
  expect(
    cast1({
      foo: '12.15',
      bar: 'false',
      baz: 'baaaz'
    })
  ).toEqual({
    foo: 12.15,
    bar: false,
    baz: 'baaaz'
  });
});

test("should support combination of query-cast's", () => {
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
