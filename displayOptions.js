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
              try {
                return feature${featureLabelPropStack.map(k => '[\'' + k + '\']').join('')};
              }
              catch(e) { return null; } // catches cases where some features lack nested property, or other errors
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
  
  // Feature extrusion property
  extrusion: {
    values: [],
    apply: (scene, value, { featureExtrusionPropStack }) => {
      scene.global.labelState = {
        featureExtrusionPropStack
      };

      if (featureExtrusionPropStack) {
        // custom JS tangram function to access nested properties efficiently
        var extrudeProperty =
          `function(feature) {
              try {
                return feature${featureExtrusionPropStack.map(k => '[\'' + k + '\']').join('')} + 0;
              }
              catch(e) { return null; } // catches cases where some features lack nested property, or other errors
            }`;
        console.log('extrudeProperty:',extrudeProperty,featureExtrusionPropStack);
        scene.global.lookupFeatureExtrusionProp = extrudeProperty;
        scene.layers._xyz_polygons.draw._polygons_inlay.order = 2001 // move polygons above roads
        scene.layers._xyz_polygons.draw._polygons_inlay.extrude = scene.global.lookupFeatureExtrusionProp;
        scene.layers._xyz_polygons._outlines.draw._lines.extrude = scene.global.lookupFeatureExtrusionProp;
        scene.cameras.camera1.type = 'perspective';
      }
      else {
        scene.layers._xyz_polygons.draw._polygons_inlay.order = 200;
        scene.layers._xyz_polygons.draw._polygons_inlay.extrude = false;
        scene.layers._xyz_polygons._outlines.draw._lines.extrude = false;

      }
    }
  },
  
  
  
  
  
//   pointScale: {
//     values: [],
//     apply: (scene, value, { featurePointScalePropStack,  }) => {
//       scene.global.pointScaleState = {
//         featurePointScalePropStack
//       };

//       if (featurePointScalePropStack) {
//         // custom JS tangram function to access nested properties efficiently
//         scene.global.lookupFeatureLabelProp =
//           `function(feature) {
//               try {
//                 return feature${featurePointScalePropStack.map(k => '[\'' + k + '\']').join('')};
//               }
//               catch(e) { return null; } // catches cases where some features lack nested property, or other errors
//             }`;

//         // show/hide labels
//         scene.layers._xyz_dots.draw.points.text.visible = true;
//         scene.layers._xyz_polygons.draw.text.visible = true;
//         scene.layers._xyz_lines.draw.text.visible = true;
//       }
//       else {
//         scene.layers._xyz_dots.draw.points.text.visible = false;
//         scene.layers._xyz_polygons.draw.text.visible = false;
//         scene.layers._xyz_lines.draw.text.visible = false;
//       }
//     }
//   },
  
  
  
  
  // Feature colors
  colors: {
    values: ['xray', 'property', 'hash', 'range', 'rank'],

    apply: (scene, value, { featurePropStack, featurePropMinFilter, featurePropMaxFilter, featurePropPalette, featurePropPaletteFlip, featurePropValueCounts, featurePropHideOutliers, featurePropValue, colorHelpers }) => {
      scene.global.colorMode = value;
      scene.global.colorState = {
        featurePropStack, featurePropMinFilter, featurePropMaxFilter, featurePropPalette, featurePropPaletteFlip, featurePropValueCounts, featurePropHideOutliers, featurePropValue,
        colorHelpers // include color helper functions in Tangram global state
      };
      console.log('featurePropStack',featurePropStack)

      if (featurePropStack) {
        // custom JS tangram function to access nested properties efficiently
        scene.global.lookupFeatureProp =
          `function(feature) {
            try {
              return feature${featurePropStack.map(k => '[\'' + k + '\']').join('')};
            }
            catch(e) { return null; } // catches cases where some features lack nested property, or other errors
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
    values: [0, 1, 2, 3, 4],
    apply: (scene, value) => {
      if (value === 0) { // small
        scene.layers._xyz_dots.draw.points.size = '6px';
        scene.layers._xyz_dots.draw.points.outline.width = null;
      }
      else if (value === 1) { // smaller
        scene.layers._xyz_dots.draw.points.size = '3px';
        scene.layers._xyz_dots.draw.points.outline.width = null;
      }
      else if (value === 2) { // bigger
        scene.layers._xyz_dots.draw.points.size = '15px';
        scene.layers._xyz_dots.draw.points.outline.width = '1px';
      }
      else if (value === 3) { // big
        scene.layers._xyz_dots.draw.points.size = '12px';
        scene.layers._xyz_dots.draw.points.outline.width = '1px';
      }
       else if (value === 4) { // medium
        scene.layers._xyz_dots.draw.points.size = '9px';
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
    values: [0, 1, 2, 3],
    apply: (scene, value) => {
      if (value === 0) { // no outline
        scene.layers._xyz_polygons._outlines.draw._lines.width = '0px';
//         scene.layers._xyz_lines.draw._lines.outline = {}
        scene.layers._xyz_lines.draw._lines.outline.width = '0px';
        scene.layers._xyz_dots.draw.points.outline.width = '0px';
      }
      else if (value === 1) { // subtle grey polygons
        scene.layers._xyz_polygons._outlines.draw._lines.width = '1px'; // polygons have a default aqua outline
        scene.layers._xyz_polygons._outlines.draw._lines.color = [.5,.5,.5,.5];
        scene.layers._xyz_lines.draw._lines.outline.width = '1px';
        scene.layers._xyz_lines.draw._lines.outline.color = [.5,.5,.5,.5];
        scene.layers._xyz_dots.draw.points.outline.width = '1px';
        scene.layers._xyz_dots.draw.points.outline.color = [.5,.5,.5,.5];

      }
      else if (value === 2) { // white outlines
        scene.layers._xyz_polygons._outlines.draw._lines.width = '1px';
        scene.layers._xyz_polygons._outlines.draw._lines.color = [1,1,1,0.75];
        scene.layers._xyz_lines.draw._lines.outline.width = '1px';
        scene.layers._xyz_lines.draw._lines.outline.color = [1,1,1,.75];
        scene.layers._xyz_dots.draw.points.outline.width = '1px';
        scene.layers._xyz_dots.draw.points.outline.color = [1,1,1,0.75];
      }
      else if (value === 3) { // black outlines
        scene.layers._xyz_polygons._outlines.draw._lines.width = '1px';
        scene.layers._xyz_polygons._outlines.draw._lines.color = [0,0,0,0.75];
        scene.layers._xyz_lines.draw._lines.outline.width = '1px';
        scene.layers._xyz_lines.draw._lines.outline.color = [0,0,0,0.75];
        scene.layers._xyz_dots.draw.points.outline.width = '1px';
        scene.layers._xyz_dots.draw.points.outline.color = [0,0,0,0.75];
      }
      // TODO take point fill color, assign assign as point outline color, and remove fill entirely
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

  roads: {
    parse: parseInt,
    values: [1, 0, 2], // 1 = on, 0 = off, 2 = just road labels, no lines
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
    // we're using displayOptions for storing and parsing values, but they get applied when creating
    // the Tangram data source in index.js, so there's no `apply()` function here
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
