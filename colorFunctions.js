
const colorFunctions = {
  xray: {
    useProperty: false
    // no color function is defined, default one will be used
  },

  // color by hash of entire
  hash: {
    useProperty: false,
    color: colorHash
  },

  // color by hash of specific property
  property: {
    useProperty: true,
    color: colorHash,
  },

  // color by value of specific property, in provided min/max range
  range: {
    useProperty: true,
    color: function (value, colorState) {
      var palette = colorState.featurePropPalette;
      var min = colorState.featurePropMin;
      var max = colorState.featurePropMax;
      var delta = max - min;
      var number = parseFloat(value);

      if (min == null || max == null || typeof number !== 'number' || isNaN(number)) {
        return 'rgba(128, 128, 128, 0.5)'; // handle null/undefined values
      }

      var ratio = (delta === 0 ? 1 : Math.max(Math.min(1 - ((max - number) / delta), 1), 0));
      var viridis = Math.round(ratio * 255);
      var color = palette[viridis];

      try {
        return `rgb(${color.map(c => c * 255).join(', ')})`;
      }
      catch(e) {
        return 'rgba(128, 128, 128, 0.5)';
      }
    }
  },

  // color by value of specific property, based on frequency of values
  rank: {
    useProperty: true,
    color: function (value, colorState) {
      var palette = colorState.featurePropPalette;
      var counts = (colorState.featurePropValueCounts || []).filter(c => c[0] != null); // exclude nulls
      var rank = counts.findIndex(c => c[0] === value);

      if (rank === -1) {
        return 'rgba(128, 128, 128, 0.5)'; // handle null/undefined values
      }

      var ratio = Math.max(Math.min(1 - (rank / counts.length), 1), 0);
      var viridis = Math.round(ratio * 255);
      var color = palette[viridis];

      try {
        return `rgb(${color.map(c => c * 255).join(', ')})`;
      }
      catch (e) {
        return 'rgba(128, 128, 128, 0.5)';
      }
    }
  }

};

function colorHash (value) {
  if (typeof value !== 'string') {
    value = (value === undefined ? 'undefined' : JSON.stringify(value));
  }

  if (['null', 'undefined'].indexOf(value) > -1) {
    return 'rgba(128, 128, 128, 0.5)'; // handle null/undefined values
  }

  let hash = 0, i, chr;
  if (value === 0) { hash = 0 };
  for (i = 0; i < value.length; i++) {
    chr = value.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  var color = 'hsla(' + hash + ', 100%, 50%, 0.75)';
  return color;
}
