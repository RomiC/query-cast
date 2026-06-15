import assert from 'node:assert/strict';

import * as queryCast from 'query-cast';

const expectedExports = ['Types', 'combineQueryCasts', 'parseQuery', 'queryCast'].sort();

assert.deepStrictEqual(Object.keys(queryCast).sort(), expectedExports);

const cast = queryCast.queryCast({ foo: queryCast.Types.FLOAT });
const result = cast('?foo=12.15');

assert.ok(typeof result === 'object');
assert.ok(result.foo === 12.15);

console.log('ESM smoke test passed ✓');
