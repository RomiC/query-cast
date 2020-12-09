# query-cast ![Tests](https://github.com/RomiC/query-cast/workflows/Tests/badge.svg) [![Coverage Status](https://coveralls.io/repos/github/RomiC/query-cast/badge.svg)](https://coveralls.io/github/RomiC/query-cast) [![Renovatebot badge](https://badges.renovateapi.com/github/RomiC/query-cast)](https://renovatebot.com/)

Is a small utility which helps you parse and cast the query (or search) params of the url:

```ts
import { queryCast, Types } from 'query-cast';

const schema = {
  foo: Types.FLOAT,
  bar: Types.BOOLEAN,
  baz: Types.STRING
};

const cast = queryCast(schema);

cast('?foo=12.15&bar=false&baz=baaaz'); // {foo: 12.15, bar: false, baz: 'baaaz'}
```

You may ask, why do you need to create a cast function first? Because in this case you can combine as many cast functions as you want using `combineQueryCasts` method:

```ts
import { combineQueryCasts, squeryCast, Types } from 'query-cast';

const foo = queryCast({
  foo: Types.FLOAT
});

const barBaz = queryCast({
  bar: Types.BOOLEAN,
  baz: Types.STRING
});

const cast = combineQueryCasts({
  foo,
  barBaz
});

cast('?foo=12.15&bar=false&baz=baaaz'); // {foo: {foo: 12.15}, barBaz: {bar: false, baz: 'baaaz'}}
```

You may think of it as a reducers from [`redux`](https://github.com/reduxjs/redux/) library. So, you split these parsers into small peacies and use them separately or combine when you need some of them at the same time.

## API

`query-cast` is a combination of two great libraries: [`query-string`](https://github.com/sindresorhus/query-string) and [`typeable.js`](https://github.com/xpepermint/typeablejs). So, it supports params and options of both.

### `queryCast(schema[, parserOptions])`

Create cast function based upon schema.

- `schema: {[key: string]: Types | [Types]}` – describe the shape of the ouput. You should use the types from `Types`-enum from the lib while defining it. List of supported types below:

  - `Types.STRING` – string value will left as is
  - `Types.BOOLEAN` – convert to boolean. Any number which is greater than 0, `Infinity`, `'1'`, `'yes'`, `'+'` will be cast to `true`.
  - `Types.INTEGER` – convert to interger
  - `Types.FLOAT` – convert to float
  - `Types.NUMBER` – alias of `Types.FLOAT`
  - `Types.DATE` – convert to `Date`-object
  - `Types.ANY` – the same as `Types.STRING`

- `parserOptions` – additional parser options, which would pass to [`query-string.parse`](https://github.com/sindresorhus/query-string#parsestring-options)-method:

  - `decode: boolean = true` - Decode the keys and values. URL components are decoded with [`decode-uri-component`](https://github.com/SamVerschueren/decode-uri-component).

  - `arrayFormat: string = 'none'` - One of the following:


    * `'bracket'` - Parse arrays with bracket representation: `foo[]=1&foo[]=2&foo[]=3`

    * `'index'` - Parse arrays with index representation: `foo[0]=1&foo[1]=2&foo[3]=3`

    * `'comma'` - Parse arrays with elements separated by comma: `foo=1,2,3`

    * `'none'` - Parse arrays with elements using duplicate keys: `foo=1&foo=2&foo=3`

### `combineQueryCasts(casts)`

Create a new cast function based upon the object, whose params are different cast functions and gather the result into a single object, whose keys correspond to the keys of the passed cast functions.

- `casts: {[key: string]: queryCast}` – An object whose values correspond to different cast functions that need to be combined into one.
