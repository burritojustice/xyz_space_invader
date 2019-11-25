import _ from 'lodash';
import { colorFunctions } from './colorFunctions';

export const displayOptions = {

  // Buildings on/off
  buildings: {
    parse: parseInt,
    values: [1, 0],
    apply: (scene, value) => {
      _.set(scene, 'layers.buildings.enabled', (value === 1));
    }
  },


  // Feature label property
  label: {
    values: [],
    apply: (scene, value, { featureLabelPropStack }) => {
      let showLabels;
      if (featureLabelPropStack) {
        // custom JS tangram function to access nested properties efficiently
        _.set(scene, 'global.lookupFeatureLabelProp',
          `function(feature) {
              try {
                return feature${featureLabelPropStack.map(k => '[\'' + k + '\']').join('')};
              }
              catch(e) { return null; } // catches cases where some features lack nested property, or other errors
            }`);

        showLabels = true;
      }
      else {
        showLabels = false;
      }

      // show/hide labels
      _.set(scene, 'layers._xyz_dots.draw.points.text.visible', showLabels);
      _.set(scene, 'layers._xyz_polygons.draw.text.visible', showLabels);
      _.set(scene, 'layers._xyz_lines.draw.text.visible', showLabels);
    }
  },

  // Feature colors
  colors: {
    values: ['xray', 'property', 'hash', 'range', 'rank'],

    apply: (scene, value, { featurePropStack, featurePropMinFilter, featurePropMaxFilter, featurePropPalette, featurePropPaletteFlip, featurePropValueCounts, featurePropHideOutliers, featurePropValue, colorHelpers }) => {
      _.set(scene, 'global.colorMode', value);
      _.set(scene, 'global.colorState', {
        featurePropStack, featurePropMinFilter, featurePropMaxFilter, featurePropPalette, featurePropPaletteFlip, featurePropValueCounts, featurePropHideOutliers, featurePropValue,
        colorHelpers // include color helper functions in Tangram global state
      });

      if (featurePropStack) {
        // custom JS tangram function to access nested properties efficiently
        _.set(scene, 'global.lookupFeatureProp',
          `function(feature) {
            try {
              return feature${featurePropStack.map(k => '[\'' + k + '\']').join('')};
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
      if (colorFunctions[value] && colorFunctions[value].color &&
          (featurePropStack || !colorFunctions[value].useProperty)) {
        featureColorVal = 'function(){ return global.featureColorDynamic(feature, global); }';
      }
      else {
        featureColorVal = 'function(){ return global.featureColorDefault(feature, global, $geometry); }';
      }

      _.set(scene, 'layers._xyz_polygons.draw._polygons_inlay.color', featureColorVal);
      _.set(scene, 'layers._xyz_lines.draw._lines.color', featureColorVal);
      _.set(scene, 'layers._xyz_dots.draw.points.color', featureColorVal);
    }
  },

  // Point sizes
  points: {
    parse: parseInt,
    values: [0, 1, 2, 3, 4],
    apply: (scene, value) => {
      let size, outlineWidth;

      if (value === 0) { // small
        size = '6px';
        outlineWidth = null;
      }
      else if (value === 1) { // smaller
        size = '3px';
        outlineWidth = null;
      }
      else if (value === 2) { // bigger
        size = '15px';
        outlineWidth = '1px';
      }
      else if (value === 3) { // big
        size = '12px';
        outlineWidth = '1px';
      }
       else if (value === 4) { // medium
        size = '9px';
        outlineWidth = '1px';
      }

      _.set(scene, 'layers._xyz_dots.draw.points.size', size);
      _.set(scene, 'layers._xyz_dots.draw.points.outline.width', outlineWidth);
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

      _.set(scene, 'layers._xyz_lines.draw._lines.width', width);
    }
  },

  // Outlines
  outlines: {
    parse: parseInt,
    values: [0, 1, 2, 3],
    apply: (scene, value) => {
      if (value === 0) { // no outline
        _.set(scene, 'layers._xyz_polygons._outlines.draw._lines.width', '0px');
//         _.set(scene, 'layers._xyz_lines.draw._lines.outline = {}
        _.set(scene, 'layers._xyz_lines.draw._lines.outline.width', '0px');
        _.set(scene, 'layers._xyz_dots.draw.points.outline.width', '0px');
      }
      else if (value === 1) { // subtle grey polygons
        _.set(scene, 'layers._xyz_polygons._outlines.draw._lines.width', '1px'); // polygons have a default aqua outlin)e
        _.set(scene, 'layers._xyz_polygons._outlines.draw._lines.color', [.5,.5,.5,.5]);
        _.set(scene, 'layers._xyz_lines.draw._lines.outline.width', '1px');
        _.set(scene, 'layers._xyz_lines.draw._lines.outline.color', [.5,.5,.5,.5]);
        _.set(scene, 'layers._xyz_dots.draw.points.outline.width', '1px');
        _.set(scene, 'layers._xyz_dots.draw.points.outline.color', [.5,.5,.5,.5]);
      }
      else if (value === 2) { // white outlines
        _.set(scene, 'layers._xyz_polygons._outlines.draw._lines.width', '1px');
        _.set(scene, 'layers._xyz_polygons._outlines.draw._lines.color', [1,1,1,0.75]);
        _.set(scene, 'layers._xyz_lines.draw._lines.outline.width', '1px');
        _.set(scene, 'layers._xyz_lines.draw._lines.outline.color', [1,1,1,.75]);
        _.set(scene, 'layers._xyz_dots.draw.points.outline.width', '1px');
        _.set(scene, 'layers._xyz_dots.draw.points.outline.color', [1,1,1,0.75]);
      }
      else if (value === 3) { // black outlines
        _.set(scene, 'layers._xyz_polygons._outlines.draw._lines.width', '1px');
        _.set(scene, 'layers._xyz_polygons._outlines.draw._lines.color', [0,0,0,0.75]);
        _.set(scene, 'layers._xyz_lines.draw._lines.outline.width', '1px');
        _.set(scene, 'layers._xyz_lines.draw._lines.outline.color', [0,0,0,0.75]);
        _.set(scene, 'layers._xyz_dots.draw.points.outline.width', '1px');
        _.set(scene, 'layers._xyz_dots.draw.points.outline.color', [0,0,0,0.75]);
      }
      // TODO take point fill color, assign assign as point outline color, and remove fill entirely
    }
  },

  // places on/off
  places: {
    parse: parseInt,
    values: [1, 0],
    apply: (scene, value) => {
      _.set(scene, 'layers.places.enabled', (value === 1));
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
        _.set(scene, 'layers.roads.draw.lines.visible', true);
      }
      else if (value === 2) {
        _.set(scene, 'layers.roads.enabled', 'true');
        _.set(scene, 'layers.roads.draw.lines.visible', false); // just labels, no geometry
        _.set(scene, 'layers.pois.enabled', (value === 1)); // to handle road exit numbers
      }
    }
  },
  
  // toggle XYZ H3 hexbin clustering
  clustering: {
    parse: parseInt,
    values: [0, 1, 2], // 0 = raw data, 1 = h3 clustering, 2 - h3 hexbin centroids
    // we're using displayOptions for storing and parsing values, but they get applied when creating
    // the Tangram data source in index.js, so there's no `apply()` function here
  },
  
  // toggle hexbins
  hexbins: {
    parse: parseInt,
    values: [0, 1, 2], // 0 = source, 1 = hexbins, 2 = centroids
    // we're using displayOptions for storing and parsing values, but they get applied when creating
    // the Tangram data source in index.js, so there's no `apply()` function here
  },

  // Water under/over
  water: {
    parse: parseInt,
    values: [0, 1],
    apply: (scene, value) => {
      if (value === 0) {
        _.set(scene, 'layers._xyz_polygons.draw._polygons_inlay.order', 200);
      }
      else if (value === 1) {
        _.set(scene, 'layers._xyz_polygons.draw._polygons_inlay.order', 300);
      }
    }
  }
}
