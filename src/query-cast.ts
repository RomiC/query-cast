import { cast } from 'typeable';
import { default as queryString, ParseOptions } from 'query-string';

export enum Types {
  STRING = 'String',
  BOOLEAN = 'Boolean',
  INTEGER = 'Integer',
  NUMBER = 'Number',
  FLOAT = 'Float',
  DATE = 'Date',
  ANY = 'Any'
}

type CastSchema = {
  [key: string]: Types | [Types];
};

type QueryParser<S> = (query: string) => Record<keyof S, any>;

export function queryCast<S extends CastSchema>(
  schema: S,
  options?: ParseOptions
): QueryParser<S> {
  const schemaKeys = Object.keys(schema);

  return function(query: string): Record<keyof S, any> {
    const parsed = queryString.parse(query, options);

    return schemaKeys.reduce(
      (result, key) => {
        const value = parsed[key];
        if (value) {
          result[key] = cast(value, schema[key]);
        }

        return result;
      },
      Object.create(null) as Record<keyof S, any>
    );
  };
}

export function combineQueryCast<S>(
  casts: Record<keyof S, QueryParser<S>>
): QueryParser<S> {
  const castsKeys = Object.keys(casts);

  return function(query: string): Record<keyof S, any> {
    return castsKeys.reduce(
      (result, key) => {
        result[key] = casts[key](query);

        return result;
      },
      Object.create(null) as Record<keyof S, any>
    );
  };
}
