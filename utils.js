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
    for (var prop in obj) {
      parseNestedObject(obj[prop], level + 1, prop, [...propStack, prop], rows);
    }
  } else {
    rows.push({ level, obj, prop: formatPropStack(propStack), value: obj, propStack });
  }
  return rows;
}
