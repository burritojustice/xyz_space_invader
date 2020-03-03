import _ from 'lodash';
import { vizModes } from './vizModes';
import { parsePropStack } from './utils';

export function defaultDisplayOptionValue(p) {
  if (displayOptions[p]) {
    return displayOptions[p].default || (displayOptions[p].values && displayOptions[p].values[0]);
  }
}

export const displayOptions = {

  // Buildings on/off
  buildings: {
    parse: parseInt,
    values: [1, 0],
    apply: (scene, value) => {
      _.set(scene, 'layers.buildings.enabled', (value === 1));
      _.merge(scene.layers.buildings, { data: {} }); // ensure there is at least an empty data block, to suppress warnings
    }
  },

  // Feature label property
  label: {
    values: [],
    apply: (scene, value) => {
      let showLabels;
      const featureLabelPropStack = parsePropStack(value);
      if (featureLabelPropStack) {
        // custom JS tangram function to access nested properties efficiently
        _.set(scene, 'global.lookupFeatureLabelProp',
          `function(feature) {
              try {
                return feature${featureLabelPropStack.map(k => `['${k}']`).join('')};
              }
              catch(e) { return null; } // catches cases where some features lack nested property, or other errors
            }`);

        showLabels = true;
      }
      else {
        showLabels = false;
      }

      // show/hide labels
      _.set(scene, 'layers._xyz_dots.draw.xyz_points.text.visible', showLabels);
      _.set(scene, 'layers._xyz_polygons.draw.xyz_text.visible', showLabels);
      _.set(scene, 'layers._xyz_lines.draw.xyz_text.visible', showLabels);
    }
  },

  // Feature colors
  vizMode: {
    values: ['xray', 'property', 'hash', 'range', 'rank'],

    apply: (scene, value, { featureProp, featurePropMinFilter, featurePropMaxFilter, featurePropPalette, featurePropPaletteFlip, featurePropValueCounts, featurePropHideOutliers, featurePropValue, vizHelpers }) => {
      _.set(scene, 'global.vizMode', value);
      _.set(scene, 'global.viz', {
        featureProp, featurePropMinFilter, featurePropMaxFilter, featurePropPalette, featurePropPaletteFlip, featurePropValueCounts, featurePropHideOutliers, featurePropValue,
        vizHelpers // include color helper functions in Tangram global state
      });

      const featurePropStack = parsePropStack(featureProp);
      if (featurePropStack) {
        // custom JS tangram function to access nested properties efficiently
        _.set(scene, 'global.lookupFeatureProp',
          `function(feature) {
            try {
              return feature${featurePropStack.map(k => `['${k}']`).join('')};
            }
            catch(e) { return null; } // catches cases where some features lack nested property, or other errors
          }`);
      }

      // Use color mode color calc function if one exists, and a feature property is selected if required.
      // We need to wrap the global function in another function, because these scene settings may be applied
      // before the global being referenced has been created yet (e.g. these changes may be merged on top of
      // the scene with the global feature color functions). Wrapping them ensures they only need to be
      // created by the time the scene is built (once all merging is complete).
      let featureColorVal;
      if (vizModes[value] && vizModes[value].color &&
          (featurePropStack || !vizModes[value].useProperty)) {
        featureColorVal = 'dynamic';
      }
      else {
        featureColorVal = 'default';
      }

      _.set(scene, 'global.featureColorType', featureColorVal);
    }
  },

  // Patterns (shader-based)
  pattern: {
    values: ['', 'stripes', 'dash'],
    apply: (scene, value) => {
      // Set active pattern
      _.set(scene, 'styles.xyz_pattern', value ? { mix: `xyz_pattern_${value}` } : {});
    }
  },

  patternColor: {
    default: '#84c6f9',
    apply: (scene, value) => {
      // Set active pattern color
      // parse hex color to RGB value from 0-1
      const rgb = value ?
        [1, 3, 5].map(i => parseInt(value.substr(i, 2), 16) / 255) : [1, 1, 1];
      _.set(scene, 'styles.xyz_pattern.shaders.uniforms.u_pattern_color', rgb);
    }
  },

  // Point sizes
  points: {
    parse: parseInt,
    values: [0, 1, 2, 3, 4],
    apply: (scene, value, { featurePointSizeProp, featurePointSizeRange }) => {
      let size;
      console.log('featurePointSizeProp', featurePointSizeProp)

      // ignore explicit point size setting when a feature property is selected
      const featurePointSizePropStack = parsePropStack(featurePointSizeProp);
      if (featurePointSizePropStack) {
        // custom JS tangram function to access nested properties efficiently
        _.set(scene, 'global.lookupFeaturePointSizeProp',
          `function(feature) {
              try {
                return feature${featurePointSizePropStack.map(k => `['${k}']`).join('')};
              }
              catch(e) { return null; } // catches cases where some features lack nested property, or other errors
            }`);

        _.set(scene, 'global.featurePointSizeRange', featurePointSizeRange);

        if (featurePointSizeRange[0] != null && featurePointSizeRange[1] != null) {
          size = `function(){ return global.featurePointSizeDynamic(feature, global); }`;
        }
        else {
          // TODO: use rank or quantiles for non-numeric properties
          size = '6px'; // use fixed point size for non-numeric properties
        }
      }
      else if (value === 0) { // small
        size = '6px';
      }
      else if (value === 1) { // smaller
        size = '3px';
      }
      else if (value === 2) { // bigger
        size = '15px';
      }
    else if (value === 3) { // big
        size = '12px';
      }
      else if (value === 4) { // medium
        size = '9px';
      }

      _.set(scene, 'global.featurePointSize', size);
    }
  },

  // Line widths
  lines: {
    parse: parseInt,
    values: [0, 1, 2],
    apply: (scene, value) => {
      let width;

      if (value === 0) {
        width = '4px';
      }
      else if (value === 1) {
        width = '2px';
      }
      else if (value === 2) {
        width = '1px';
      }

      _.set(scene, 'layers._xyz_lines.draw.xyz_lines.width', width);
    }
  },

  // Outlines
  outlines: {
    parse: parseInt,
    values: [0, 1, 2, 3, 4, 5, 6],
    apply: (scene, value) => {
      let width, color;
      let donutOutline = false;

      if (value === 0) { // no outline
        width = '0px';
      }
      else if (value === 1) { // subtle grey polygons
        width = '1px';
        color = [.5, .5, .5, .5];
      }
      else if (value === 2) { // white outlines
        width = '1px';
        color = [1, 1, 1, 0.75];
      }
      else if (value === 3) { // black outlines
        width = '1px';
        color = [0, 0, 0, 0.75];
      }
      else if (value === 4) { // donut outlines thick
        width = '2px';
        color = [.5, .5, .5, .5];
        donutOutline = true;
      }
      else if (value === 5) { // donut outlines thin
        width = '1px';
        color = [.5, .5, .5, .5];
        donutOutline = true;
      }
       else if (value === 6) { // donut outlines hair
        width = '0.5px';
        color = [.5, .5, .5, .5];
        donutOutline = true;
      }

      _.set(scene, 'layers._xyz_polygons._outlines.draw.xyz_lines.width', width);
      _.set(scene, 'layers._xyz_polygons._outlines.draw.xyz_lines.color', color);

      _.set(scene, 'layers._xyz_lines.draw.xyz_lines.outline.width', width);
      _.set(scene, 'layers._xyz_lines.draw.xyz_lines.outline.color', color);

      _.set(scene, 'layers._xyz_dots.draw.xyz_points.outline.width', width);
      _.set(scene, 'layers._xyz_dots.draw.xyz_points.outline.color', color);
      _.set(scene, 'layers._xyz_dots.donut_points.enabled', donutOutline);
    }
  },

  // places on/off
  places: {
    parse: parseInt,
    values: [1, 0],
    apply: (scene, value) => {
      _.set(scene, 'layers.places.enabled', (value === 1));
      _.merge(scene.layers.places, { data: {} }); // ensure there is at least an empty data block, to suppress warnings
    }
  },

  roads: {
    parse: parseInt,
    values: [1, 0, 2], // 1 = on, 0 = off, 2 = just road labels, no lines
    apply: (scene, value) => {
      if (value === 0) {
        _.set(scene, 'layers.roads.enabled', false);
        _.set(scene, 'layers.pois.enabled', (value === 1)); // to handle road exit numbers
      }
      else if (value === 1) {
        _.set(scene, 'layers.roads.enabled', true);
        _.set(scene, 'layers.roads.draw.xyz_lines.visible', true);
      }
      else if (value === 2) {
        _.set(scene, 'layers.roads.enabled', 'true');
        _.set(scene, 'layers.roads.draw.xyz_lines.visible', false); // just labels, no geometry
        _.set(scene, 'layers.pois.enabled', (value === 1)); // to handle road exit numbers
      }

      // ensure there is at least an empty data block, to suppress warnings
      _.merge(scene.layers.roads, { data: {} });
      _.merge(scene.layers.pois, { data: {} });
    }
  },
  
  // toggle XYZ H3 hexbin clustering
  clustering: {
    parse: parseInt,
    values: [0, 1, 2, 3, 4] // 0 = source, 1 = h3 hexbins, 2 = h3 centroids, 3 - quadbins, 4 - quadbin centroids
    // we're using displayOptions for storing and parsing values, but they get applied when creating
    // the Tangram data source in index.js, so there's no `apply()` function here
  },
//   quadCountmode: {
// //     parse: parseInt,
//     values: ["mixed", "estimated", "real"] // mixed is the default
//     // we're using displayOptions for storing and parsing values, but they get applied when creating
//     // the Tangram data source in index.js, so there's no `apply()` function here
//   },
//   quadRez: {
//     parse: parseInt,
//     values: ['', 0, 1, 2, 3, 4] 
//     // we're using displayOptions for storing and parsing values, but they get applied when creating
//     // the Tangram data source in index.js, so there's no `apply()` function here
//   },
  // toggle CLI hexbins
  hexbins: {
    parse: parseInt,
    values: [0, 1, 2] // 0 - raw data, 1 - hexbins (cli), 2 - hexbin centroids
    // we're using displayOptions for storing and parsing values, but they get applied when creating
    // the Tangram data source in index.js, so there's no `apply()` function here
  },

  // Water under/over
  water: {
    parse: parseInt,
    values: [0, 1],
    apply: (scene, value) => {
      if (value === 0) {
        _.set(scene, 'layers._xyz_polygons.draw.xyz_polygons.order', 200);
      }
      else if (value === 1) {
        _.set(scene, 'layers._xyz_polygons.draw.xyz_polygons.order', 300);
      }
    }
  }
}
