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
    values: ['xray', 'range', 'rank', 'property', 'hash'],

    apply: (scene, value, { featureProp, featurePropMin, featurePropMax, featurePropPalette, featurePropValueCounts }) => {
      scene.global.colorMode = value;
      scene.global.colorState = { featureProp, featurePropMin, featurePropMax, featurePropPalette, featurePropValueCounts };

      // use color mode color calc function if one exists, and a feature property is selected if required
      if (colorFunctions[value] && colorFunctions[value].color &&
          (featureProp || !colorFunctions[value].useProperty)) {

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
        scene.layers._xyz_dots.draw.points.outline.color = [.5, .5, .5, 0.5];
        scene.layers._xyz_dots.draw.points.outline.width = '.5px';
      }
      else if (value === 1) { // big
        scene.layers._xyz_dots.draw.points.size = '16px';
        scene.layers._xyz_dots.draw.points.outline.color = [.5, .5, .5, 0.5];
        scene.layers._xyz_dots.draw.points.outline.width = '1px';
      }
      else if (value === 2) { // medium
        scene.layers._xyz_dots.draw.points.size = '12px';
        scene.layers._xyz_dots.draw.points.outline.color = [.5, .5, .5, 0.5];
        scene.layers._xyz_dots.draw.points.outline.width = '1px';
      }
      else if (value === 3) { // smaller
        scene.layers._xyz_dots.draw.points.size = '3px';
        scene.layers._xyz_dots.draw.points.outline.color = scene.global.outline_none;
        scene.layers._xyz_dots.draw.points.outline.width = scene.global.outline_none;
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
        scene.layers._xyz_dots.draw.points.outline = scene.global.grey
        scene.layers._xyz_lines.draw._lines.outline = scene.global.grey

      }
      else {
        scene.layers._xyz_polygons._outlines.draw._lines.width = '0px';
        scene.layers._xyz_dots.draw.points.outline.width = '0px';
        scene.layers._xyz_lines.draw._lines.outline.width = '0px';
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
        scene.layers._xyz_lines.draw._lines.outline = scene.global.outline_none;
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
