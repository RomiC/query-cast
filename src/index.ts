import {
  default as queryString,
  ParsedQuery,
  ParseOptions
} from 'query-string';
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

type ParsedCastQuery<S> = Record<keyof S, any>;

interface CastSchema {
  [key: string]: Types | [Types];
}

type QueryCast<S extends any> = (
  query: string | ParsedQuery
) => ParsedCastQuery<S>;

type QueryCastsMapObject<S = any> = { [K in keyof S]: QueryCast<S[K]> };

export function queryCast<S extends CastSchema>(
  schema: S,
  options?: ParseOptions
): QueryCast<S> {
  const schemaKeys = Object.keys(schema);

  return (query: string | ParsedQuery) => {
    const parsed =
      typeof query === 'string' ? queryString.parse(query, options) : query;

    return schemaKeys.reduce(
      (result, key) => {
        const value = parsed[key];
        if (value) {
          result[key] = cast(value, schema[key]);
        }

        return result;
      },
      Object.create(null) as ParsedCastQuery<S>
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
      Object.create(null) as ParsedCastQuery<S>
    );
  };
}
