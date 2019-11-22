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
  if (value == null || typeof value === 'number') { // don't bother parsing these
    return value;
  }

  const m = value.match(/[-+]?([0-9]+,?)*\.?[0-9]+/); // get floating point or integer via regex
  const num = parseFloat(m && m[0].replace(/,/g, '')); // strip commas, e.g. '1,500' => '1500' (NB only works for US-style numbers)
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
