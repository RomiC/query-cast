import './styles.css';
import { combineQueryCast, queryCast, Types } from './query-cast';

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

const result1 = cast1('?foo=12.15&bar=false&baz=baaaz');
const result2 = cast2('?fooFoo=12.15&barBar=false&bazBaz=baaaz');

const combinedCast = combineQueryCast({
  cast1,
  cast2
});

const combinedResult = combinedCast(
  '?foo=12.15&bar=false&baz=baaaz&fooFoo=12.15&barBar=false&bazBaz=baaaz'
);
// console.log(cast1.bar, cast1.baz);
console.log(combinedResult);

document.getElementById('app').innerHTML = `
<h1>Hello query-caster!</h1>
`;
