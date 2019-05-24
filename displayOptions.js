// export default {
const displayOptions = {

  // Buildings on/off
  buildings: {
    parse: parseInt,
    values: [1, 0],
    apply: (scene, value) => {
      if (scene.layers.buildings) {
        scene.layers.buildings.enabled = (value === 1);
      }
    }
  },

  // Feature colors
  colors: {
    values: ['xray', 'property', 'hash', 'range', 'rank'],

    apply: (scene, value, { featurePropStack, featurePropMin, featurePropMax, featurePropPalette, featurePropPaletteFlip, featurePropValueCounts, colorHelpers }) => {
      scene.global.colorMode = value;
      scene.global.colorState = {
        featurePropStack, featurePropMin, featurePropMax, featurePropPalette, featurePropPaletteFlip, featurePropValueCounts,
        colorHelpers
      };

      if (featurePropStack) {
        // custom JS tangram function to access nested properties efficiently
        scene.global.lookupFeatureProp =
          `function(feature) {
            return feature${featurePropStack.map(k => '[\'' + k + '\']').join('')};
          }`;
      }

      // use color mode color calc function if one exists, and a feature property is selected if required
      if (colorFunctions[value] && colorFunctions[value].color &&
          (featurePropStack || !colorFunctions[value].useProperty)) {

        scene.layers._xyz_polygons.draw._polygons_inlay.color = scene.global.featureColorDynamic;
        scene.layers._xyz_lines.draw._lines.color = scene.global.featureColorDynamic;
        scene.layers._xyz_dots.draw.points.color = scene.global.featureColorDynamic;
        // TODO: outline colors?
      }
      // otherwise use default ("xray" mode)
      else {
        scene.layers._xyz_polygons.draw._polygons_inlay.color = scene.global.featureColorDefault;
        scene.layers._xyz_lines.draw._lines.color = scene.global.featureColorDefault;
        scene.layers._xyz_dots.draw.points.color = scene.global.featureColorDefault;
      }
    }
  },

  // Point sizes
  points: {
    parse: parseInt,
    values: [0, 1, 2, 3],
    apply: (scene, value) => {
      if (value === 0) { // small
        scene.layers._xyz_dots.draw.points.size = '6px';
        scene.layers._xyz_dots.draw.points.outline.color = null;
        scene.layers._xyz_dots.draw.points.outline.width = null;
      }
      else if (value === 1) { // big
        scene.layers._xyz_dots.draw.points.size = '16px';
        scene.layers._xyz_dots.draw.points.outline.color = [1, 1, 1, 0.5];
        scene.layers._xyz_dots.draw.points.outline.width = '1px';
      }
      else if (value === 2) { // smaller
        scene.layers._xyz_dots.draw.points.size = '3px';
        scene.layers._xyz_dots.draw.points.outline.color = null;
        scene.layers._xyz_dots.draw.points.outline.width = null;
      }
      else if (value === 3) { // medium
        scene.layers._xyz_dots.draw.points.size = '12px';
        scene.layers._xyz_dots.draw.points.outline.color = [1, 1, 1, 0.5];
        scene.layers._xyz_dots.draw.points.outline.width = '1px';
      }
    }
  },

  // Line widths
  lines: {
    parse: parseInt,
    values: [0, 1, 2],
    apply: (scene, value) => {
      if (value === 0) {
        scene.layers._xyz_lines.draw._lines.width = '4px';
      }
      else if (value === 1) {
        scene.layers._xyz_lines.draw._lines.width = '2px';
      }
      else if (value === 2) {
        scene.layers._xyz_lines.draw._lines.width = '1px';
      }
    }
  },

  // Outlines
  outlines: {
    parse: parseInt,
    values: [0, 1],
    apply: (scene, value) => {
      if (value === 1) {
        scene.layers._xyz_polygons._outlines.draw._lines.width = '1px';
      }
      else {
        scene.layers._xyz_polygons._outlines.draw._lines.width = '0px';
      }
    }
  },

  // Highlights
  highlight: {
    parse: parseInt,
    values: [0, 1],
    apply: (scene, value) => {
      if (value === 1) {
        scene.layers._xyz_lines.draw._lines.outline = scene.global.highlight;
        scene.layers._xyz_dots.draw.points.size = '12px';
        scene.layers._xyz_polygons._outlines.draw._lines.width = '3px';
      }
      else {
        scene.layers._xyz_lines.draw._lines.outline = null;
        // scene.layers._xyz_dots.draw.points.size = '6px';
        // scene.layers._xyz_polygons._outlines.draw._lines.width = '1px';
      }
    }
  },

  // Roads on/off
  roads: {
    parse: parseInt,
    values: [1, 0],
    apply: (scene, value) => {
      if (scene.layers.roads) {
        scene.layers.roads.enabled = (value === 1);
      }

      if (scene.layers.pois) {
        scene.layers.pois.enabled = (value === 1); // to handle exit numbers
      }
    }
  },

  // Water under/over
  water: {
    parse: parseInt,
    values: [0, 1],
    apply: (scene, value) => {
      if (value === 0) {
        scene.layers._xyz_polygons.draw._polygons_inlay.order = 200;
      }
      else if (value === 1) {
        scene.layers._xyz_polygons.draw._polygons_inlay.order = 300;
      }
    }
  },

};
