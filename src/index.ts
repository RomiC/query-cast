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

type TypesMap = {
  [Types.ANY]: any;
  [Types.BOOLEAN]: boolean;
  [Types.DATE]: Date;
  [Types.INTEGER]: number;
  [Types.NUMBER]: number;
  [Types.FLOAT]: number;
  [Types.STRING]: string;
};

type InferType<T> = T extends Types
  ? TypesMap[T]
  : T extends Types[]
  ? Array<TypesMap[T[0]]>
  : never;

type ParsedCastQuery<S extends CastSchema> = {
  [K in keyof S]: InferType<S[K]>
};

/**
 * Describe the schema of query parsing
 */
interface CastSchema {
  [key: string]: Types | [Types];
}

/**
 * Define combination of two or more schemas
 */
type CastSchemaMap = {
  [K: string]: CastSchema;
};

/**
 * Cast function for parsing and casting the query
 */
type QueryCast<S extends CastSchema> = (
  query: string | ParsedQuery
) => ParsedCastQuery<S>;

type QueryCastMap<S extends CastSchemaMap> = {
  [K in keyof S]: QueryCast<S[K]>
};

type InferQueryCastType<T> = T extends QueryCastMap<infer S>
  ? { [K in keyof S]: ParsedCastQuery<S[K]> }
  : never;

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
          result[key as keyof S] = cast(value, schema[key]);
        }

        return result;
      },
      Object.create(null) as ParsedCastQuery<S>
    );
  };
}

export function combineQueryCasts<T extends QueryCastMap<any>>(
  casts: T
): (query: string) => InferQueryCastType<T> {
  const castsKeys = Object.keys(casts);

  return (query: string) => {
    return castsKeys.reduce(
      (result, key) => {
        result[key as keyof T] = casts[key as keyof T](
          query
        ) as InferQueryCastType<T>[keyof T];

        return result;
      },
      Object.create(null) as InferQueryCastType<T>
    );
  };
}
