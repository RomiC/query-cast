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

const CHAR_TYPE = 1;
const DIGIT_TYPE = 2;
const UNRESERVED_TYPE = 3;

type Categories = {
  [key: number]: typeof CHAR_TYPE | typeof DIGIT_TYPE;
};

const CATEGORIES: Uint32Array = new Uint32Array(128);

for (let i = 0; i <= 126; i++) {
  CATEGORIES[i] = (isChar(i) && CHAR_TYPE) || (isDigit(i) && DIGIT_TYPE) || (isUnreserved(i) && UNRESERVED_TYPE);
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

type MODE = 'init' | 'name' | 'index' | 'value' | 'hash';

type QueryParams = {
  [key: string]: string | string[] | QueryParams;
};

function appendParamValue(root: QueryParams, name: string, index: string, value: string): void {
  if (!name) {
    return;
  }

  const nameToAppend = decodeURIComponent(name);
  const valueToAppend = decodeURIComponent(value);
  const indexToAppend = parseInt(index, 10);

  if (root[nameToAppend] != null) {
    if (!Array.isArray(root[nameToAppend])) {
      root[nameToAppend] = [root[nameToAppend] as string];
    }

    // (root[nameToAppend] as string[])[+index] = valueToAppend;

    if (isNaN(indexToAppend)) {
      (root[nameToAppend] as string[]).push(valueToAppend);
    } else {
      (root[nameToAppend] as string[])[indexToAppend] = valueToAppend;
    }
  } else {
    root[nameToAppend] = valueToAppend;
  }
}

function parseQuery(query: string): { [key: string]: any } {
  const root: QueryParams = {};
  let currentVar = root;
  let currentVarName = '';
  let currentVarIndex = '';
  let currentVal = '';

  let mode: MODE = 'init';

  for (
    let i = 0, char: string = query[0], charCode: number = query.charCodeAt(0);
    i <= query.length + 1;
    char = query[++i], charCode = query.charCodeAt(i)
  ) {
    if (isNaN(charCode) || charCode === HASH_SIGN) {
      appendParamValue(currentVar, currentVarName, currentVarIndex, currentVal);
      break;
    }

    switch (mode) {
      case 'init':
        if (charCode === QUESTION_SIGN) {
          continue;
        } else if (isDigit(charCode) || isChar(charCode)) {
          mode = 'name';
        }

      case 'name':
        if (
          isDigit(charCode) ||
          isChar(charCode) ||
          charCode === DASH_SIGN ||
          charCode === TILDE_SIGN ||
          charCode === UNDERSCORE_SIGN ||
          charCode === PERCENT_SIGN
        ) {
          currentVarName += char;
        } else if (charCode === DOT_SIGN) {
          if (typeof currentVar[currentVarName] !== 'object') {
            currentVar[currentVarName] = {};
          }
          currentVar = currentVar[currentVarName] as QueryParams;
          currentVarName = '';
        } else if (charCode === OPEN_SQUARE_BRACKET_SIGN) {
          if (typeof currentVar[currentVarName] !== 'object') {
            currentVar[currentVarName] = [];
          }
          mode = 'index';
        } else if (charCode === EQUAL_SIGN) {
          mode = 'value';
        } else if (charCode === AMPERSAND_SIGN) {
          currentVar[currentVarName] = '';
          currentVarIndex = '';
          currentVarName = '';
          currentVar = root;
        }
        continue;

      case 'index':
        if (charCode === EQUAL_SIGN) {
          mode = 'value';
        } else if (charCode !== CLOSE_SQUARE_BRACKET_SIGN) {
          currentVarIndex += char;
        }
        continue;

      case 'value':
        if (charCode !== AMPERSAND_SIGN) {
          currentVal += char;
          continue;
        } else if (charCode === AMPERSAND_SIGN) {
          appendParamValue(currentVar, currentVarName, currentVarIndex, currentVal);
          currentVar = root;
          currentVarName = currentVarIndex = currentVal = '';
          mode = 'name';
          continue;
        }
    }
  }

  return root;
}

export default parseQuery;
