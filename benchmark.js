const Benchmark = require('benchmark');

const { default: parseQuery } = require('./dist/utils/parse-query');
const { parse } = require('query-string');

const suite = new Benchmark.Suite();

const TEST_STRING =
  'author=&chapters=1&chapters=2&chapters=3&characters.main.name=John&characters.main.surname=Doe&genre=Epic%20fantasy&none&page=2&published=true&symbols=%CF%80%C2%B5';

// Query-string parser
suite.add('query-string parser', () => parse(TEST_STRING));

// Query-cast parser
suite.add('query-cast parser', () => parseQuery(TEST_STRING));

// Log/display the results
suite.on('cycle', (event) => {
  const { name, hz } = event.target;
  const opsPerSec = Math.round(hz).toLocaleString();

  console.log(name.padEnd(36, '_') + opsPerSec.padStart(12, '_') + ' ops/s');
});

suite.run();
