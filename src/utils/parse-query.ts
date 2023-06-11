const HASH_SIGN = 35; // #
const PERCENT_SIGN = 37; // %
const AMPERSAND_SIGN = 38; // &
const DOT_SIGN = 46; // .
const EQUAL_SIGN = 61; // =
const QUESTION_SIGN = 63; // ?
const TILDE_SIGN = 126; // ~
const UNDERSCORE_SIGN = 95; // _
const DASH_SIGN = 45; // -

const OPEN_SQUARE_BRACKET_SIGN = 91; // [
const CLOSE_SQUARE_BRACKET_SIGN = 93; // ]

const CHAR_BIG_START = 65;
const CHAR_BIG_END = 90;
const CHAR_SMALL_START = 97;
const CHAR_SMALL_END = 122;
const DIG_START = 48;
const DIG_END = 57;

const CHARACTER = 1;
const DIGIT = 2;
const UNRESERVED = 3;
const RESERVED = 4;

const CATEGORIES: Uint32Array = new Uint32Array(128);

for (let i = 0; i <= 126; i++) {
  CATEGORIES[i] = (isChar(i) && CHARACTER) || (isDigit(i) && DIGIT) || (isUnreserved(i) && UNRESERVED) || RESERVED;
}

function charCodeInRange(code: number, min: number, max: number): boolean {
  return code >= min && code <= max;
}

function isChar(charCode: number): boolean {
  return (
    charCodeInRange(charCode, CHAR_SMALL_START, CHAR_SMALL_END) ||
    charCodeInRange(charCode, CHAR_BIG_START, CHAR_BIG_END)
  );
}

function isDigit(charCode: number): boolean {
  return charCodeInRange(charCode, DIG_START, DIG_END);
}

function isUnreserved(charCode: number): boolean {
  return (
    charCode === DOT_SIGN ||
    charCode === UNDERSCORE_SIGN ||
    charCode === TILDE_SIGN ||
    charCode === PERCENT_SIGN ||
    charCode === DASH_SIGN
  );
}

type QueryParams = {
  [key: string]: string | string[] | QueryParams;
};

function appendParamValue(root: QueryParams, name: string, value: string, index = -1): void {
  if (!name) {
    return;
  }

  const currentValue = root[name];

  if (currentValue != null || index >= 0) {
    if (!Array.isArray(currentValue)) {
      const arr: string[] = [];

      if (currentValue != null) {
        arr.push(root[name] as string);
      }

      root[name] = arr;
    }

    if (index <= 0) {
      (root[name] as string[]).push(value);
    } else {
      (root[name] as string[])[index] = value;
    }
  } else {
    root[name] = value;
  }
}

class Scanner {
  public char: string = null;
  public code = -1;
  /**
   * Index varies from -1 to _input.length
   */
  private index = -1;

  constructor(private input: string) {}

  next(): number | symbol {
    if (this.index >= this.input.length) {
      return Scanner.EOL;
    }

    ++this.index;

    if (this.index === this.input.length) {
      this.char = null;
      this.code = -1;
      return Scanner.EOL;
    }

    this.char = this.input[this.index];
    this.code = this.input.charCodeAt(this.index);

    return this.index;
  }

  static EOL = Symbol('SCANNING_COMPLETE');
}

function scanName(root: QueryParams, scanner: Scanner): { name: string; root: QueryParams } {
  let name = '';
  let decodeRequire = false;

  cycle: do {
    let paramName: string;

    switch (scanner.code) {
      case DOT_SIGN:
        paramName = decodeURIComponent(name);
        root = root[paramName] = root[paramName] || Object.create(null);
        name = '';
        break;

      case HASH_SIGN:
      case EQUAL_SIGN:
      case OPEN_SQUARE_BRACKET_SIGN:
      case AMPERSAND_SIGN:
        break cycle;

      case QUESTION_SIGN:
        continue;

      case PERCENT_SIGN:
        decodeRequire = true;

      default:
        name += scanner.char;
    }
  } while (scanner.next() !== Scanner.EOL);

  return { name: decodeRequire ? decodeURIComponent(name) : name, root };
}

function scanIndex(scanner: Scanner): number {
  let index = '';

  if (scanner.code !== OPEN_SQUARE_BRACKET_SIGN) {
    return -1;
  }

  do {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (scanner.code === CLOSE_SQUARE_BRACKET_SIGN) {
      break;
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (scanner.code === HASH_SIGN) {
      break;
    }

    if (CATEGORIES[scanner.code] === DIGIT) {
      index += scanner.char;
    }
  } while (scanner.next() !== Scanner.EOL);

  return parseInt(index, 10) || 0;
}

function scanValue(scanner: Scanner): string {
  let value = '';
  let decodeRequire = false;

  do {
    if (scanner.code === AMPERSAND_SIGN) {
      break;
    }

    if (scanner.code === HASH_SIGN) {
      break;
    }

    if (scanner.code === PERCENT_SIGN) {
      decodeRequire = true;
    }

    const category = CATEGORIES[scanner.code];
    if (category != null && category !== RESERVED) {
      value += scanner.char;
    }
  } while (scanner.next() !== Scanner.EOL);

  return decodeRequire ? decodeURIComponent(value) : value;
}

function parseQuery(query: string): QueryParams {
  const root: QueryParams = Object.create(null);

  const scanner = new Scanner(query);

  while (scanner.code !== HASH_SIGN && scanner.next() !== Scanner.EOL) {
    const { name, root: currentRoot } = scanName(root, scanner);
    const index = scanIndex(scanner);
    const value = scanValue(scanner);

    appendParamValue(currentRoot, name, value, index);
  }
  return root;
}

export default parseQuery;
