import { parseNumber } from './utils';

export const vizModes = {
  // color by value of specific property, in provided min/max range
  range: {
    label: 'value range',
    useProperty: true,
    usePalette: true,
    limitRange: true,
    defaultSort: 'values',
    value: function (value, viz) {
      // produces a value between 0-1 for the current feature value
      var min = viz.featurePropMinFilter;
      var max = viz.featurePropMaxFilter;
      var delta = max - min;
      var number = viz.vizHelpers.parseNumber(value);

      if (min == null || max == null || typeof number !== 'number' || isNaN(number)) {
        return null;
      }

      var ratio = (delta === 0 ? 1 : Math.max(Math.min(1 - ((max - number) / delta), 1), 0));
      return ratio;
    },
    color: function (value, viz) {
      // returns a color for the palette and feature value
      var palette = viz.featurePropPalette;
      var index = this.value(value, viz); // index into palette
      if (index == null) {
        return 'rgba(128, 128, 128, 0.5)'; // handle null/undefined values
      }
      return viz.vizHelpers.getPaletteColor(palette, index, 0.75, viz.featurePropPaletteFlip);
    }
  },

  // color by value of specific property, based on frequency of values
  rank: {
    label: 'value rank',
    useProperty: true,
    usePalette: true,
    defaultSort: 'count',
    value: function (value, viz) {
      // produces a value between 0-1 for the current feature value
      var palette = viz.featurePropPalette;
      var counts = (viz.featurePropValueCounts || []).filter(c => c[0] != null); // exclude nulls
      var rank = counts.findIndex(c => c[0] === value);

      if (rank === -1) {
        return null;
      }

      var ratio; // number from 0-1 that maps to the palette color index to use

      if (palette.type === 'categorical') {
        // optional categorical assigment
        if (rank < palette.values.length) {
          ratio = rank / (palette.values.length-1); // assign the top values to a single color
        }
        else {
          ratio = 1.01; // use value > 1 to signify out of range;
        }
      }
      else {
        // by default, interpolate through palette values
        ratio = (counts.length <= 1 ? 1 : Math.max(Math.min(1 - (rank / (counts.length - 1)), 1), 0));
      }

      return ratio;
    },
    color: function (value, viz) {
      // returns a color for the palette and feature value
      var palette = viz.featurePropPalette;
      var index = this.value(value, viz); // index into palette
      if (index > 1) {
        return 'rgba(255, 255, 255, 0.5)'; // bucket the remaining values as white
      }
      else if (index == null) {
        return 'rgba(128, 128, 128, 0.5)'; // handle null/undefined values
      }
      return viz.vizHelpers.getPaletteColor(palette, index, 0.75, viz.featurePropPaletteFlip);
    }
  },

  // color by hash of specific property
  property: {
    label: 'property hash',
    useProperty: true,
    usePalette: true,
    defaultSort: 'count',
    color: function (value, viz) {
      var palette = viz.featurePropPalette;
      // cycle through all colors in a categorical palette, or 7 evenly spaced colors in any other palette
      var palSize = (palette.type === 'categorical' ? palette.values.length : 7);
      var hash = viz.vizHelpers.hashValue(value);
      if (hash == null) {
        return 'rgba(128, 128, 128, 0.5)'; // handle null/undefined values
      }
      var ratio = (hash % palSize) / (palSize - 1); // cycle through colors
      return viz.vizHelpers.getPaletteColor(palette, ratio, 0.75, false);
    }
  },

  // color by hash of entire feature
  hash: {
    label: 'feature hash',
    useProperty: false,
    usePalette: false,
    color: function (value, viz) {
      var hash = viz.vizHelpers.hashValue(value);
      if (hash == null) {
        return 'rgba(128, 128, 128, 0.5)'; // handle null/undefined values
      }
      return 'hsla(' + hash + ', 100%, 50%, 0.75)';
    }
  },

  xray: {
    label: 'geometry type',
    useProperty: false,
    usePalette: false,
    // no color function is defined, default one will be used
  },

};

// These functions are included in the Tangram global scene state, and therefore can be
// called by the color functions above (references to any non-global functions get lost when the
// scene is serialized and sent to the worker -- the functions must be self-contained and only
// reference Tangram globals, feature properties, and other predefined variables).
export const vizHelpers = {
  parseNumber, // referenced here to provide access to Tangram
  hashValue, // referenced here to provide access to Tangram

  getPaletteColor: function getPaletteColor (palette, value, alpha = 1, flip = false) {
    try {
      value = Math.max(Math.min(value, 1), 0); // clamp to 0-1

      if (flip) {
        value = 1 - value; // optionally flip palette
      }

      // function-based palette
      if (typeof palette.values === 'function') {
        return palette.values(value, alpha);
      }
      // array-based palette
      else {
        const index = Math.round(value * (palette.values.length-1));
        const color = palette.values[index];
        return `rgba(${color.map(c => Math.floor(c * 255)).join(', ')}, ${alpha})`;
      }
    }
    catch (e) {
      return 'rgba(128, 128, 128, 0.5)';
    }
  }
};

function hashValue(value) {
  if (typeof value !== 'string') {
    value = (value === undefined ? 'undefined' : JSON.stringify(value));
  }

  if (['null', 'undefined'].indexOf(value) > -1) {
    return null; // handle null/undefined values
  }

  let hash = 0, i, chr;
  if (value === 0) { hash = 0 };
  for (i = 0; i < value.length; i++) {
    chr = value.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}
