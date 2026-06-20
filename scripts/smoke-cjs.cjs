const assert = require('node:assert/strict');

const queryCast = require('query-cast');

const expectedExports = ['Types', 'combineQueryCasts', 'queryCast'].sort();

const topLevel = { ...queryCast };
delete topLevel.default;

assert.deepStrictEqual(Object.keys(topLevel).sort(), expectedExports);

for (const key of expectedExports) {
  assert.ok(topLevel[key], `Expected ${key} to be exported`);
}

const cast = queryCast.queryCast({ foo: queryCast.Types.FLOAT });
const result = cast('?foo=12.15');

assert.ok(typeof result === 'object');
assert.ok(result.foo === 12.15);

console.log('CJS smoke test passed ✓');
