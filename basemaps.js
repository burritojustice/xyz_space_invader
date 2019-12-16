import _ from 'lodash';

export function getBasemapScene(basemap, projection) {
  // deep copy the selected basemap object with lodash, to avoid modifying the original object
  var b = _.merge({}, basemaps[basemap]);
  // add the desired projection to the imports
  var p = getProjectionScene(projection);
  if (b.import && p) b.import.push(p)
  return b;
}

export function getBasemapName(basemap) {
  // if the basemap looks like a number, return name from by index number
  // this is mostly for backwards compatibility, could be removed in future
  const index = parseInt(basemap);
  if (typeof index === 'number' && !isNaN(index)) {
    return Object.keys(basemaps)[index];
  }

  // otherwise just return the name
  return basemap;
}

export function getDefaultBasemapName() {
  return Object.keys(basemaps)[0];
}

export function getNextBasemap(basemap) {
  // return (index + 1) % Object.keys(basemaps).length;
  const names = Object.keys(basemaps);
  const index = names.indexOf(basemap);
  if (index > -1) {
    return names[(index + 1) % names.length]; // return next basemap if current one found
  }
  return names[0]; // otherwise just return first basemap
}

// add the base path of the current page to the URL
function addBasePath(url) {
  let base = window.location.origin + window.location.pathname;
  if (base.slice(-1) !== '/') {
    base += '/';
  }
  return base + url;
}

export function getProjectionScene(projection) {
  if (typeof projection !== "undefined" && projection !== "null") {
    if (!projections[projection]) console.error("Projection \""+projection+"\" not found");
    return projections[projection].file;
  }
  else return null
}

// skeletal structure of Invader viz scene, merged on top of underlying basemap, extended at run-time
// based on current viz settings
const xyzTangramBaseScene = addBasePath('tangram_xyz_scene.yaml');

// this gets merged into basemaps to change 'mapzen' vector tile source definitions to their XYZ HERE equivalent
// TODO: this does not yet override terrain/normal tiles for hillshading
const xyzTilezenSourceOverride = {
  sources: {
    mapzen: {
      url: 'https://xyz.api.here.com/tiles/osmbase/512/all/{z}/{x}/{y}.mvt',
      url_params: {
        'access_token': 'global.xyz_access_token'
      }
    }
  }
};

// each basemap can reference one of these font presets for labels, or define its own inline instead
const labelFontPresets = {
  // for dark basemaps
  dark: {
    fill: [.9, .9, .1],
    size: '12px',
    stroke: {
      color: 'black',
      width: '4px'
    }
  },
  // for light basemaps
  light: {
    fill: 'darkred',
    size: '12px',
    stroke: {
      color: 'white',
      width: '4px'
    }
  }
};

export const basemaps = {
  'xyz-pixel': {
    import: [
      'https://raw.githubusercontent.com/sensescape/xyz-pixel/master/scene.yaml',
      xyzTangramBaseScene
    ],
    global: {
      featureLabelFont: labelFontPresets.light
    },
    ...xyzTilezenSourceOverride
  },
  'xyz-pixel-dark': {
    import: [
      'https://raw.githubusercontent.com/sensescape/xyz-pixel-dark/master/scene.yaml',
      xyzTangramBaseScene
    ],
    global: {
      featureLabelFont: labelFontPresets.dark
    },
    ...xyzTilezenSourceOverride
  },
  'xyz-pixel-pastel': {
    import: [
      'https://raw.githubusercontent.com/sensescape/xyz-pixel-pastel/master/scene.yaml',
      xyzTangramBaseScene
    ],
    global: {
      featureLabelFont: labelFontPresets.light
    },
    ...xyzTilezenSourceOverride
  },
  'xyz-dots': {
    import: [
      'https://raw.githubusercontent.com/sensescape/xyz-dots/master/scene.yaml',
      xyzTangramBaseScene
    ],
    global: {
      featureLabelFont: labelFontPresets.light
    },
    ...xyzTilezenSourceOverride
  },
  'xyz-dots-dark': {
    import: [
      'https://raw.githubusercontent.com/sensescape/xyz-dots-dark/master/scene.yaml',
      xyzTangramBaseScene
    ],
    global: {
      featureLabelFont: labelFontPresets.dark
    },
    ...xyzTilezenSourceOverride
  },
  'xyz-bw-texture': {
    import: [
      'https://raw.githubusercontent.com/sensescape/bw-texture/master/scene.yaml',
      xyzTangramBaseScene
    ],
    global: {
      featureLabelFont: labelFontPresets.light
    },
    ...xyzTilezenSourceOverride
  },
  'xyz-grid': {
    import: [
      'https://raw.githubusercontent.com/sensescape/xyz-grid/master/scene.yaml',
      xyzTangramBaseScene
    ],
    global: {
      featureLabelFont: labelFontPresets.light
    },
    ...xyzTilezenSourceOverride
  },
  'xyz-grid-dark': {
    import: [
      'https://raw.githubusercontent.com/sensescape/xyz-grid-dark/master/scene.yaml',
      xyzTangramBaseScene
    ],
    global: {
      featureLabelFont: labelFontPresets.dark
    },
    ...xyzTilezenSourceOverride
  },
  'xyz-grid-color': {
    import: [
      'https://raw.githubusercontent.com/sensescape/xyz-grid-color/master/scene.yaml',
      xyzTangramBaseScene
    ],
    global: {
      featureLabelFont: labelFontPresets.light
    },
    ...xyzTilezenSourceOverride
  },
  'xyz-elevation-dots': {
    import: [
      'https://raw.githubusercontent.com/sensescape/xyz-elevation-dots/master/scene.yaml',
      xyzTangramBaseScene
    ],
    global: {
      featureLabelFont: labelFontPresets.dark
    },
    ...xyzTilezenSourceOverride
  },
  'xyz-studio-spring-soft': {
    import: [
      'https://raw.githubusercontent.com/sensescape/xyz-studio-spring-soft/master/scene.yaml',
      xyzTangramBaseScene
    ],
    global: {
      featureLabelFont: labelFontPresets.light
    },
    ...xyzTilezenSourceOverride
  },
  'xyz-studio-spring-bright': {
    import: [
      'https://raw.githubusercontent.com/sensescape/xyz-studio-spring-bright/master/scene.yaml',
      xyzTangramBaseScene
    ],
    global: {
      featureLabelFont: labelFontPresets.light
    },
    ...xyzTilezenSourceOverride
  },
  'xyz-studio-miami-day': {
    import: [
      'https://raw.githubusercontent.com/sensescape/xyz-studio-miami-day/master/scene.yaml',
      xyzTangramBaseScene
    ],
    global: {
      featureLabelFont: labelFontPresets.light
    },
    ...xyzTilezenSourceOverride
  },
   'xyz-studio-light': {
    import: [
      'https://raw.githubusercontent.com/sensescape/xyz-studio-light/master/scene.yaml',
      xyzTangramBaseScene
    ],
    global: {
      featureLabelFont: labelFontPresets.light
    },
    ...xyzTilezenSourceOverride
  },
    'xyz-studio-dark': {
    import: [
      'https://raw.githubusercontent.com/sensescape/xyz-studio-dark/master/scene.yaml',
      xyzTangramBaseScene
    ],
    global: {
      featureLabelFont: labelFontPresets.dark
    },
    ...xyzTilezenSourceOverride
  },

  'mapzen-refill-dark': {
    import: [
      'https://www.nextzen.org/carto/refill-style/refill-style.zip',
      'https://www.nextzen.org/carto/refill-style/themes/color-gray-gold.zip',
      'https://www.nextzen.org/carto/refill-style/themes/label-4.zip',
      // 'https://www.nextzen.org/carto/refill-style/themes/terrain-shading-dark.zip',
      xyzTangramBaseScene
    ],
    global: {
      featureLabelFont: labelFontPresets.dark
    },
    ...xyzTilezenSourceOverride
  },
  'mapzen-refill': {
    import: [
      'https://www.nextzen.org/carto/refill-style/refill-style.zip',
      'https://www.nextzen.org/carto/refill-style/themes/label-4.zip',
      'https://www.nextzen.org/carto/refill-style/themes/terrain-shading-dark.zip',
      xyzTangramBaseScene
    ],
    global: {
      featureLabelFont: labelFontPresets.light
    },
    ...xyzTilezenSourceOverride
  },
  'mapzen-walkabout': {
    import: [
      'https://www.nextzen.org/carto/walkabout-style/walkabout-style.zip',
      xyzTangramBaseScene
    ],
    global: {
      featureLabelFont: labelFontPresets.light
    },
    ...xyzTilezenSourceOverride
  },
  'none': {
    import: [
      xyzTangramBaseScene
    ],
    global: {
      featureLabelFont: labelFontPresets.dark
    },
    scene: {
      background: {
        color: [0, 0, 0]
      }
    }
  },
  'satellite': {
    import: [
      'https://www.nextzen.org/carto/refill-style/refill-style.zip',
      xyzTangramBaseScene,
      addBasePath('satellite.yaml'),
    ],
    global: {
      featureLabelFont: labelFontPresets.dark
    },
    ...xyzTilezenSourceOverride
  },
  'projected': {
    import: [
      'tangram_xyz_scene_projected.yaml',
    ],
    global: {
      featureLabelFont: labelFontPresets.dark
    },
    // can't use the regular ...xyzTilezenSourceOverride beacuse max_zoom is important
    sources: {
      mapzen: {
        url: 'https://xyz.api.here.com/tiles/osmbase/512/all/{z}/{x}/{y}.mvt',
        url_params: {
          'access_token': 'global.xyz_access_token'
        },
        max_zoom: 2
      },
      _xyzspace: {
          max_zoom: 1 // important until edge tile loading is resolved
      }
    }
  }
};

export const projections = {
  'mercator': {
    file: 'mercator.yaml'
  },
  'albers': {
    file: 'albers.yaml'
  },
  'mollweide': {
    file: 'mollweide.yaml',
  }
};
