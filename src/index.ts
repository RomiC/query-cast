import { cast } from 'typeable';
import { parseQuery } from './utils/parse-query';

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [Types.ANY]: any;
  [Types.BOOLEAN]: boolean;
  [Types.DATE]: Date;
  [Types.INTEGER]: number;
  [Types.NUMBER]: number;
  [Types.FLOAT]: number;
  [Types.STRING]: string;
};

interface CastFieldSchema {
  type: Types | [Types];
  default?: unknown;
}

type CastSchemaEntry = Types | [Types] | CastFieldSchema;

type SchemaType<T> = T extends CastFieldSchema ? T['type'] : T;

type InferType<T> = SchemaType<T> extends Types
  ? TypesMap[SchemaType<T>]
  : SchemaType<T> extends [infer E]
    ? E extends Types
      ? TypesMap[E][]
      : never
    : never;

type ParsedCastQuery<S extends CastSchema> = {
  [K in keyof S]: InferType<S[K]>;
};

/**
 * Describe the schema of query parsing
 */
interface CastSchema {
  [key: string]: CastSchemaEntry;
}

/**
 * Define combination of two or more schemas
 */
type CastSchemaMap = {
  [K: string]: CastSchema;
};

/**
 * Result of parsing
 */
interface ParsedQuery<T = string> {
  [key: string]: T | T[] | null;
}

/**
 * Cast function for parsing and casting the query
 */
type QueryCast<S extends CastSchema> = (query: string | ParsedQuery) => ParsedCastQuery<S>;

type QueryCastMap<S extends CastSchemaMap> = {
  [K in keyof S]: QueryCast<S[K]>;
};

type InferQueryCastType<T> = T extends QueryCastMap<infer S> ? { [K in keyof S]: ParsedCastQuery<S[K]> } : never;

type ProcessedSchema = Record<string, { type: Types | [Types]; default?: unknown }>;

export function queryCast<S extends CastSchema>(schema: S): QueryCast<S> {
  const schemaKeys = Object.keys(schema);

  const processedSchema: ProcessedSchema = schemaKeys.reduce(
    (acc, key) => {
      const entry = schema[key];
      if (typeof entry === 'object' && !Array.isArray(entry) && entry !== null) {
        acc[key] = { type: entry.type, default: entry.default };
      } else {
        acc[key] = { type: entry, default: undefined };
      }
      return acc;
    },
    Object.create(null) as ProcessedSchema
  );

  return (query: string | ParsedQuery) => {
    const parsed = typeof query === 'string' ? parseQuery(query) : query;

    return schemaKeys.reduce(
      (result, key) => {
        const { type, default: defaultValue } = processedSchema[key];
        const value = parsed[key];

        if (value != null) {
          result[key as keyof S] = cast(value, type);
        } else if (defaultValue !== undefined) {
          result[key as keyof S] = defaultValue as InferType<S[keyof S]>;
        }

        return result;
      },
      Object.create(null) as ParsedCastQuery<S>
    );
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function combineQueryCasts<T extends QueryCastMap<any>>(casts: T): (query: string) => InferQueryCastType<T> {
  const castsKeys = Object.keys(casts);

  return (query: string) => {
    return castsKeys.reduce(
      (result, key) => {
        result[key as keyof T] = casts[key as keyof T](query) as InferQueryCastType<T>[keyof T];

        return result;
      },
      Object.create(null) as InferQueryCastType<T>
    );
  };
}
