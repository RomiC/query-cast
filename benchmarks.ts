import { Suite } from 'benchmark';
import { parse, stringify } from 'query-string';
import parseQuery from './src/utils/parse-query';

const suite = new Suite();

// Fixtures
const TEST_OBJECT: any = {
  genre: 'Epic fantasy',
  author: '',
  page: 2,
  published: true,
  symbols: 'πµ',
  chapters: [1, 2, 3],
  characters: {
    main: {
      name: 'John',
      surname: 'Doe'
    }
  },
  none: null
};
const TEST_STRING = stringify(TEST_OBJECT);

// Query-string parser
suite.add('query-string parser', () => parse(TEST_STRING));

// Query-cast parser
suite.add('query-cast parser', () => parseQuery(TEST_STRING));

// Log/display the results
suite.on('cycle', (event: any) => {
  const { name, hz } = event.target;
  const opsPerSec = Math.round(hz).toLocaleString();

  console.log(name.padEnd(36, '_') + opsPerSec.padStart(12, '_') + ' ops/s');
});

suite.run();
