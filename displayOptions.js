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

  // Random feature color
  colors: {
    values: ['x-ray', 'property', 'random', 'range'],

    apply: (scene, value, { selectedFeatureProp, selectedFeaturePropMin, selectedFeaturePropMax }) => {
      if (value === 'random') {
        scene.layers._xyz_polygons.draw._polygons_inlay.color = scene.global.color_hash;
        scene.layers._xyz_lines.draw._lines.color = scene.global.color_hash;
        scene.layers._xyz_dots.draw.points.color = scene.global.color_hash;
      }
      else if (value === 'range') { // apply min/max range to viridian palette
        scene.global.viridis_value.prop = selectedFeatureProp;
        scene.global.viridis_value.min = selectedFeaturePropMin;
        scene.global.viridis_value.max = selectedFeaturePropMax;
        scene.layers._xyz_polygons.draw._polygons_inlay.color = scene.global.viridis_value.color_range;
        scene.layers._xyz_lines.draw._lines.color = scene.global.viridis_value.color_range;
        scene.layers._xyz_dots.draw.points.color = scene.global.viridis_value.color_range;
      }
      else if (value === 'property')   {
        if (selectedFeatureProp) {
          scene_config.global.property_hash_name = selectedFeatureProp;
          scene_config.layers._xyz_dots.draw.points.color = scene_config.global.var_property_color_hash;
          scene_config.layers._xyz_lines.draw._lines.color = scene_config.global.var_property_color_hash;
          scene_config.layers._xyz_polygons.draw._polygons_inlay.color = scene_config.global.var_property_color_hash;
          scene_config.layers._xyz_polygons._outlines.enabled = false;
        }
        else {
          scene_config.layers._xyz_lines.draw._lines.color = scene_config.global.color_lines;
          scene_config.layers._xyz_dots.draw.points.color = scene_config.global.color_points;
          scene_config.layers._xyz_polygons.draw._polygons_inlay.color = scene_config.global.color_polygons;
        }
      }
      else if (value === 'x-ray') {
        scene.layers._xyz_polygons.draw._polygons_inlay.color = scene.global.color_polygons;
        scene.layers._xyz_lines.draw._lines.color = scene.global.color_lines;
        scene.layers._xyz_polygons._outlines.draw._lines.color = scene.global.color_lines;
        scene.layers._xyz_dots.draw.points.color = scene.global.color_points;
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
