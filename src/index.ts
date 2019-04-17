import { default as queryString, ParseOptions } from 'query-string';
import { cast } from 'typeable';

export enum Types {
  STRING = 'String',
  BOOLEAN = 'Boolean',
  INTEGER = 'Integer',
  NUMBER = 'Number',
  FLOAT = 'Float',
  DATE = 'Date',
  ANY = 'Any'
}

type Parsed<S> = Record<keyof S, any>;

interface CastSchema {
  [key: string]: Types | [Types];
}

type QueryCast<S extends any> = (query: string) => Parsed<S>;

type QueryCastsMapObject<S = any> = { [K in keyof S]: QueryCast<S[K]> };

export function queryCast<S extends CastSchema>(
  schema: S,
  options?: ParseOptions
): QueryCast<S> {
  const schemaKeys = Object.keys(schema);

  return (query: string) => {
    const parsed = queryString.parse(query, options);

    return schemaKeys.reduce(
      (result, key) => {
        const value = parsed[key];
        if (value) {
          result[key] = cast(value, schema[key]);
        }

        return result;
      },
      Object.create(null) as Parsed<S>
    );
  };
}

export function combineQueryCasts<S>(
  casts: QueryCastsMapObject<S>
): QueryCast<S> {
  const castsKeys = Object.keys(casts);

  return (query: string) => {
    return castsKeys.reduce(
      (result, key) => {
        result[key as keyof S] = casts[key as keyof S](query);

        return result;
      },
      Object.create(null) as Parsed<S>
    );
  };
}
