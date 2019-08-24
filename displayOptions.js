import { colorFunctions } from './colorFunctions';

export const displayOptions = {

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
  

  // Feature label property
  label: {
    values: [],
    apply: (scene, value, { featureLabelPropStack }) => {
      scene.global.labelState = {
        featureLabelPropStack
      };

      if (featureLabelPropStack) {
        // custom JS tangram function to access nested properties efficiently
        scene.global.lookupFeatureLabelProp =
          `function(feature) {
              return feature${featureLabelPropStack.map(k => '[\'' + k + '\']').join('')};
            }`;

        // show/hide labels
        scene.layers._xyz_dots.draw.points.text.visible = true;
        scene.layers._xyz_polygons.draw.text.visible = true;
        scene.layers._xyz_lines.draw.text.visible = true;
      }
      else {
        scene.layers._xyz_dots.draw.points.text.visible = false;
        scene.layers._xyz_polygons.draw.text.visible = false;
        scene.layers._xyz_lines.draw.text.visible = false;
      }
    }
  },

  // Feature colors
  colors: {
    values: ['xray', 'property', 'hash', 'range', 'rank'],

    apply: (scene, value, { featurePropStack, featurePropMinFilter, featurePropMaxFilter, featurePropPalette, featurePropPaletteFlip, featurePropValueCounts, featurePropHideOutliers, featurePropValue, colorHelpers }) => {
      scene.global.colorMode = value;
      scene.global.colorState = {
        featurePropStack, featurePropMinFilter, featurePropMaxFilter, featurePropPalette, featurePropPaletteFlip, featurePropValueCounts, featurePropHideOutliers, featurePropValue,
        colorHelpers // include color helper functions in Tangram global state
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
      else if (value === 1) { // smaller
        scene.layers._xyz_dots.draw.points.size = '3px';
        scene.layers._xyz_dots.draw.points.outline.color = null;
        scene.layers._xyz_dots.draw.points.outline.width = null;
      }
      else if (value === 2) { // big
        scene.layers._xyz_dots.draw.points.size = '16px';
        scene.layers._xyz_dots.draw.points.outline.color = [1, 1, 1, 0.5];
        scene.layers._xyz_dots.draw.points.outline.width = '1px';
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
        scene.layers._xyz_dots.draw.points.outline.width = '1px';
      }
      else {
        scene.layers._xyz_polygons._outlines.draw._lines.width = '0px';
        scene.layers._xyz_dots.draw.points.outline.width = '0px';
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
  
  // places on/off
  places: {
    parse: parseInt,
    values: [1, 0],
    apply: (scene, value) => {
      if (scene.layers.places) {
        scene.layers.places.enabled = (value === 1);
      }
    }
  },
  
//  // Roads on/off
//   roads: {
//     parse: parseInt,
//     values: [1, 0],
//     apply: (scene, value) => {
//       if (scene.layers.roads) {
//         scene.layers.roads.enabled = (value === 1);
//       }

//       if (scene.layers.pois) {
//         scene.layers.pois.enabled = (value === 1); // to handle road exit numbers
//       }
//     }
//   },

  roads: {
    parse: parseInt,
    values: [1, 0, 2],
    apply: (scene, value) => {
      if (scene.layers.roads) {
        if (value === 0) {
          scene.layers.roads.enabled = false;
          if (scene.layers.pois) {
            scene.layers.pois.enabled = (value === 1); // to handle road exit numbers
          }
        }
        else if (value === 1) {
          scene.layers.roads.enabled = true;
          scene.layers.roads.draw.lines.visible = true;
        }
        else if (value === 2) { 
          scene.layers.roads.enabled = 'true';
          scene.layers.roads.draw.lines.visible = false; // just labels, no geometry
          if (scene.layers.pois) {
            scene.layers.pois.enabled = (value === 1); // to handle road exit numbers
          }
        }
      }
    }
  },

  // toggle hexbins
  hexbins: {
    parse: parseInt,
    values: [0, 1, 2], // 0 = source, 1 = hexbins, 2 = centroids
    apply: (scene, value, { hexbinInfo, spaceId }) => {
      if (value === 0) {
        scene.sources._xyzspace.url = `https://xyz.api.here.com/hub/spaces/${spaceId}/tile/web/{z}_{x}_{y}`;
        scene.sources._xyzspace.url_params.tags = '';
      }
      else if (value === 1) {
        console.log('hexbins via',scene.hexbin);
        scene.sources._xyzspace.url = `https://xyz.api.here.com/hub/spaces/${hexbinInfo.spaceId}/tile/web/{z}_{x}_{y}`;
        // will need to grab current zoom and generate appropriate hexbin tag
        scene.sources._xyzspace.url_params.tags = 'zoom13_hexbin';
      }
      else if (value === 2) {
        console.log('centroids via',scene.hexbin);
        scene.sources._xyzspace.url = `https://xyz.api.here.com/hub/spaces/${hexbinInfo.spaceId}/tile/web/{z}_{x}_{y}`;
        // will need to grab current zoom and generate appropriate centroid tag
        scene.sources._xyzspace.url_params.tags = 'zoom13_centroid'
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
  }
}
