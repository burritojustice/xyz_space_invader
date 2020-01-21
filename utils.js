export const PROP_TYPES = {
  STRING: 0,
  NUMERIC: 1
};

// parse a nested object in dot and array notation (e.g. feature.a[2].b.c) into a "stack" of its components:
// ['feature', 'a', 2, 'b', 'c']
export function parsePropStack(prop) {
  return prop &&
    prop
      .replace(/\\\./g, '__DELIMITER__') // handle escaped . notation in property names
      .split('.')
      .flatMap(s => {
        // handle array bracket syntax (only for numeric indexes), e.g. names[4]
        const brackets = s.match(/\[(\d+)\]/);
        if (brackets != null && brackets.length === 2) {
          const idx = parseInt(brackets[1]); // the numeric index we found inside the brackets
          if (typeof idx === 'number' && !isNaN(idx)) {
            return [s.substr(0, brackets.index), idx]; // insert the array index
          }
        }
        return s; // continue without array index
      })
      .map(s => typeof s === 'string' ? s.replace(/__DELIMITER__/g, '.') : s); // swap out delimeter
}

// format nested property name stack with dot (object) and bracket (array) notation
export function formatPropStack(propStack) {
  return propStack &&
    propStack
      .map((p, i) => {
        const n = parseInt(p);
        if (typeof n === 'number' && !isNaN(n)) {
          return `[${p}]`;
        }
        else {
          return `${i > 0 ? '.' : ''}${p}`;
        }
      })
      .join('');
}

// parse a (potentially) nested object, tracking the level and components of each property
export function parseNestedObject(obj, level = -1, prop = null, propStack = [], rows = []) {
  if (Array.isArray(obj)) {
    if (prop) {
      rows.push({ level, obj, prop: formatPropStack(propStack), propStack }); // header row
    }
    obj.forEach((x, i) => parseNestedObject(x, level + 1, i, [...propStack, i], rows));
  } else if (typeof obj === 'object' && obj != null) {
    if (prop) {
      rows.push({ level, obj, prop: formatPropStack(propStack), propStack }); // header row
    }
    for (const p in obj) {
      parseNestedObject(obj[p], level + 1, p, [...propStack, p], rows);
    }
  } else {
    rows.push({ level, obj, prop: formatPropStack(propStack), value: obj, propStack });
  }
  return rows;
}

// lookup value of a nested feature property
export function lookupProperty(properties, propStack) {
  return propStack && propStack.reduce((obj, prop) => obj && obj[prop] !== undefined ? obj[prop] : null, properties);
}

// stringify an object with JSON.stringify, but include functions as strings
export function stringifyWithFunctions (obj) {
  if (typeof obj === 'function') {
    return obj.toString();
  }

  return JSON.stringify(obj, function (k, v) {
    // Convert functions to strings
    return (typeof v === 'function') ? v.toString() : v;
  });
};

// More robust number parsing, try to get a floating point or integer value from a string
export function parseNumber(value) {
  // don't bother parsing these
  if (value == null || typeof value === 'object' || typeof value === 'boolean') {
    return value;
  }
  else if (typeof value === 'number') {
    return isNaN(value) ? undefined : value;
  }

  const m = value.match(/[-+]?([0-9]+,?)*\.?[0-9]+/); // get floating point or integer via regex
  const num = parseFloat(m && m[0].replace(/[,-\/]/g, '')); // strip formatter chars, e.g. '1,500' => '1500' (NB only works for US-style numbers)
  if (typeof num === 'number' && !isNaN(num)) {
    return num;
  }
}

// Can a minimum % of values in an array be parsed as numbers?
export function mostlyNumeric(values, threshold = 100) {
  if(!values) {
    return false;
  }

  const numeric = values
    .map(v => parseNumber(v))
    .filter(x => typeof x === 'number' && !isNaN(x) && Math.abs(x) !== Infinity)
    .length;
  return numeric / values.length >= (threshold / 100);
}
