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
