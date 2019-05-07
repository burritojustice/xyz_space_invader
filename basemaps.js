// export { getBasemapScene, nextBasemapIndex };
Object.assign(window, { getBasemapScene, getBasemapName, getNextBasemap });


function getBasemapScene(index) {
  return basemaps[Object.keys(basemaps)[index]];
}

function getBasemapName(index) {
  return Object.keys(basemaps)[index];
}

function getNextBasemap(index) {
  return (index + 1) % Object.keys(basemaps).length;
}

const basemaps = {
  'refill-dark': {
    import: [
      'https://www.nextzen.org/carto/refill-style/refill-style.zip',
      'https://www.nextzen.org/carto/refill-style/themes/color-gray-gold.zip',
      'https://www.nextzen.org/carto/refill-style/themes/label-4.zip',
      // 'https://www.nextzen.org/carto/refill-style/themes/terrain-shading-dark.zip',
      'https://s3.amazonaws.com/xyz-demo/data/demo.yaml',
      'tangram_xyz_scene.yaml'
    ],
    layers: {
      _xyz_lines: { draw: { _lines: { color: 'global.color_lines' } } },
      _xyz_dots: { draw: { points: { color: 'global.color_points' } } }
    }
  },
  'refill': {
    import: [
      'https://www.nextzen.org/carto/refill-style/refill-style.zip',
      'https://www.nextzen.org/carto/refill-style/themes/label-4.zip',
      'https://www.nextzen.org/carto/refill-style/themes/terrain-shading-dark.zip',
      'https://s3.amazonaws.com/xyz-demo/data/demo.yaml',
      'tangram_xyz_scene.yaml'
    ]
  },
  'dots': {
    import: [
      'https://raw.githubusercontent.com/sensescape/xyz-dots/master/scene.yaml',
      'https://s3.amazonaws.com/xyz-demo/data/demo.yaml',
      'tangram_xyz_scene.yaml'
    ],
    layers: {
      _xyz_lines: { draw: { _lines: { color: [1, 0, 0, 0.5] } } },
      _xyz_dots: { draw: { points: { color: [0, 0, 1, 0.5] } } }
    }
  },
  'pixel': {
    import: [
      'https://raw.githubusercontent.com/sensescape/xyz-pixel/master/scene.yaml',
      'https://s3.amazonaws.com/xyz-demo/data/demo.yaml',
      'tangram_xyz_scene.yaml'
    ],
    layers: {
      _xyz_lines: { draw: { _lines: { color: [1, 0, 0, 0.5] } } },
      _xyz_dots: { draw: { points: { color: [0, 0, 1, 0.5] } } }
    }
  },
  'walkabout': {
    import: [
      'https://www.nextzen.org/carto/walkabout-style/walkabout-style.zip',
      'https://s3.amazonaws.com/xyz-demo/data/demo.yaml',
      'tangram_xyz_scene.yaml'
    ]
  },
  'none': {
    import: [
      'https://s3.amazonaws.com/xyz-demo/data/demo.yaml',
      'tangram_xyz_scene.yaml'
    ],
    scene: {
      background: {
        color: [0, 0, 0]
      }
    }
  },
  'satellite': {
    import: [
      'https://www.nextzen.org/carto/refill-style/refill-style.zip',
      'tangram_xyz_scene.yaml',
      'satellite.yaml',
      'https://s3.amazonaws.com/xyz-demo/data/demo.yaml',
    ]
  }
};
