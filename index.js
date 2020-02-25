import L from 'leaflet';
import 'leaflet-hash';
import 'leaflet/dist/leaflet.css';
import 'leaflet-control-geocoder';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import yaml from 'js-yaml';
import FileSaver from 'file-saver';


import AppUI from './AppUI.svelte';
import { displayOptions } from './displayOptions';
import { calcFeaturePropertyStats } from './stats';
import { stringifyWithFunctions } from './utils';

let query;
let layer, scene;
let map, hash, tooltip, popup;

// grab query parameters from the url and assign them to globals
query = new URLSearchParams(document.location.search);

var url_hash = window.location.hash.slice(1, window.location.hash.length).split('/');
var mapStartLocation = null
if (url_hash.length == 3) {
  mapStartLocation = {
    lat: Number(url_hash[1]),
    lng: Number(url_hash[2]),
    zoom: Number(url_hash[0])
  };
}

map = L.map('map', { boxZoom: false, zoomControl: false });
hash = new L.Hash(map);
tooltip = L.tooltip();
popup = L.popup({ autoPan: false, closeButton: true });

// Leaflet needs an initial location before the map is "ready", which will block Tangram layer loading
map.setView([37.7,-122.4], 2);

//add geocoder (to do: Pelias / Geocode Earth)
var here_geocoder_options = {
  app_id: '0VeWPmMuUeMebnjNVGz9',
  app_code: 'MVqjbI661R5lC2DqkAZpNg',
  defaultMarkGeocode: false
}
L.Control.Geocoder.here(here_geocoder_options).addTo(map);

// Initialize App UI
const appUI = new AppUI({
  target: document.getElementById('ui')
});

window.appUI = appUI; // debugging

// Handle UI events affecting Tangram scene
appUI.on('loadScene', state => {
  loadScene(state);
});

appUI.on('updateScene', state => {
  if (scene && scene.initialized) {
    updateScene(state, scene.config);
    scene.updateConfig();
  }
});

appUI.on('exportScene', () => {
  const state = appUI.get();
  if (state.spaceInfo && scene && scene.initialized) {
    const filename = `${state.spaceId} ${state.spaceInfo.title}.yaml`;
    const yamlScene = exportScene('yaml');
    FileSaver.saveAs(new Blob([yamlScene], { type: 'application/x-yaml' }), filename);
  }
});

// Load info on a new XYZ space
appUI.on('loadSpace', ({ spaceId, token }) => {
  getStats({ spaceId, token, mapStartLocation });
});

// Handle query string updates
appUI.on('updateQueryString', ({ queryParams }) => {
  const query = new URLSearchParams(queryParams);
  const qs = `?${query.toString()}${window.location.hash}`;
  window.history.replaceState(null, null, qs);
});

// Initialize UI with query string params
appUI.setFromQueryParams(query);

// apply updates to scene based on current display options
function updateScene(uiState, scene_config) {
  // configure data source for XYZ space
  applySpace(uiState, scene_config);

  // display options such as point size, toggling buildings or roads on/off, etc.
  applyDisplayOptions(uiState, scene_config);

  // update the tag filter on the XYZ tiles (if the tags have changed, this will cause new tiles to load)
  applyTags(uiState, scene_config);
}

// load a new scene basemap (first creating the leaflet and tangram layers if needed)
function loadScene({ basemapScene, token }) {
  // token is used for XYZ space and basemap tiles
  // defaults to initial placeholder access token if needed, replaced after space has loaded
  basemapScene.global.xyz_access_token = token || 'Qz2TvilK6PhGZSu9K-yGkA';
  basemapScene.global.sdk_api_key = 'DpCrhQqsR2igQPEINRTfcw'; // default Nextzen API key for terrain tiles

  if (layer == null) {
    // if the Tangram layer doesn't exist yet, initialize it and load the scene for the first time
    makeLayer(basemapScene);
  }
  else {
    scene.load(basemapScene);
  }
}

function exportScene(format = 'json') {
  const uiState = appUI.get();

  // First do a deep copy of the basemap, preserving functions
  const scene_config = JSON.parse(stringifyWithFunctions(uiState.basemapScene));

  // Then apply viz-specific scene state
  updateScene(uiState, scene_config);

  // Modify camera to default to current view
  const activeCamera = scene.getActiveCamera(); // get current camera for loaded scene
  const center = map.getCenter();
  scene_config.cameras = scene_config.cameras || {};
  scene_config.cameras[activeCamera] = {
    position: [center.lng, center.lat, map.getZoom()]
  };

  // Then deep copy again to ensure any compiled functions (from above step) are preserved
  // (feature color calculations, etc. are run-time defined functions)
  const jsonScene = JSON.parse(stringifyWithFunctions(scene_config));
  if (format === 'yaml') {
    return yaml.safeDump(jsonScene);
  }
  return jsonScene;
}

// initialize Tangram leaflet layer, and load the scene for the first time
function makeLayer(scene_obj) {
  // sync popup content from svelte UI component when it changes
  appUI.on('updatePopup', () => {
    popup.setContent(document.querySelector('#ui #popupContent'));
  });

  layer = Tangram.leafletLayer({
    scene: scene_obj,
    leaflet: L,
    attribution: '<a href="https://github.com/tangrams/tangram" target="_blank">Tangram</a> | &copy; OSM contributors | <a href="https://explore.xyz.here.com/">HERE XYZ</a>',
    events: {
      hover: ({ feature, leaflet_event: { latlng }, changed }) => {
        // preview feature via hover, currently NOT synced to app UI
        if (appUI.get().featurePinned) {
          return;
        }

        if (feature && feature.source_name === '_xyzspace') {
          appUI.set({ feature, featurePinned: false });

          if (!popup.isOpen()) {
            layer.openPopup(latlng);
          }
          else {
            popup.setLatLng(latlng);
          }
        }
        else {
          layer.closePopup();
        }
      },
      click: ({ feature, leaflet_event: { latlng }, changed }) => {
        // select new feature, syncs to app UI
        if (!appUI.get().featurePinned) {
          if (feature && feature.source_name === '_xyzspace') {
            if (!popup.isOpen()) {
              layer.openPopup(latlng);
            }
            else {
              popup.setLatLng(latlng);
            }

            appUI.set({ feature, featurePinned: true });
          }
        }
        // de-select feature
        else {
          layer.closePopup();
          appUI.set({ feature: null, featurePinned: false });
        }
      }
    },
    selectionRadius: 5
  });

  scene = layer.scene;

  // setup tooltip for hover content
  layer.bindTooltip(tooltip);
  layer.bindPopup(popup);

  // always clear pinned feature on close (e.g. maybe user manually closed with X button)
  layer.on('popupclose', e => {
    if (e.popup === popup) {
      appUI.set({ feature: null, featurePinned: false });
    }
  });

  map.on('zoom mouseout', () => {
    if (!appUI.get().feature) {
      layer.closePopup();
      appUI.set({ feature: null, featurePinned: false });
    }
  }); // close tooltip when zooming

  // setup Tangram event listeners
  scene.subscribe({
    load: function ({ config }) {
      // when a new scene loads (e.g. when app loads, or a new basemap is selected),
      // update with current data source and display options
      updateScene(appUI.get(), config);
    },
    view_complete: function (e) {
      // when new tiles finish loading, update viewport counts for tags and feature properties
      console.log('view complete')
      queryViewport();
    }
  });

  layer.addTo(map);

  // setup screenshot event
  document.addEventListener('keydown', ({ key }) => {
    if (key == "s") { // take screenshot
      scene.screenshot().then(function (screenshot) {
        FileSaver.saveAs(screenshot.blob, `invader-${(new URLSearchParams(appUI.get().queryParams))}.png`);
      });
    }
  });

  window.layer = layer; // debugging
  window.scene = scene;  // debugging
}
function applySpace({ spaceId, token, displayToggles: { hexbins, clustering, clusteringProp } = {}, propertySearchQueryParams, hexbinInfo }, scene_config) {

  if (spaceId && token) {
    // choose main space, or hexbins space
    const activeSpaceId = (hexbins > 0 && hexbinInfo.spaceId != null) ? hexbinInfo.spaceId : spaceId;
    const propertySearch = propertySearchQueryParams.map(v => v.join('=')).join('&');
    // build property search query string params
    // TODO: replace with native Tangram `url_params` when multiple-value support is available
    scene_config.sources = scene_config.sources || {};
    scene_config.sources._xyzspace = {
      type: 'GeoJSON',
      url: `https://xyz.api.here.com/hub/spaces/${activeSpaceId}/tile/web/{z}_{x}_{y}?${propertySearch}`,
      url_params: {
        access_token: token,
        clip: true
      }      
    };
    if (clustering == 1) {
      scene_config.sources._xyzspace.url_params.clustering = 'hexbin';
      if (clusteringProp){
        scene_config.sources._xyzspace.url_params['clustering.property'] = clusteringProp.replace(/[]"/,'')
      }
    } else if (clustering == 2) {
      scene_config.sources._xyzspace.url_params.clustering = 'hexbin';
      scene_config.sources._xyzspace.url_params['clustering.pointmode'] = true;
      if (clusteringProp){
        scene_config.sources._xyzspace.url_params['clustering.property'] = clusteringProp.replace(/[]"/,'')
      }
    }
    else {
      delete scene_config.sources._xyzspace.url_params.clustering;
    }
  }
}

function applyDisplayOptions(uiState, scene_config) {
  for (const option in displayOptions) {
    const value = uiState.displayToggles[option];
    if (value !== undefined && displayOptions[option].apply) {
      displayOptions[option].apply(scene_config, value, uiState);
    }
  }
}

function applyTags({ spaceId, tagFilterQueryParam, hexbinInfo, displayToggles: { hexbins } = {} }, scene_config) {
  // choose selected main space tags, or hexbin-specific tag
  let activeTags = tagFilterQueryParam;
  var currentZoom = scene.view.tile_zoom; // or map.getZoom() ?
  if (hexbins === 1 & Object.keys(hexbinInfo).length > 0) { // ensure hexbins info exists
    // drawing hexbins
    var hexbinZoomArray = hexbinInfo.zoomLevels
    var hexbinZoomMax = Math.max(...hexbinZoomArray)
    var hexbinZoomMin = Math.min(...hexbinZoomArray)
//     console.log(currentZoom,hexbinZoomMin,hexbinZoomMax,hexbinZoomArray)

    if (hexbinZoomArray.includes(currentZoom.toString())){ // hexbins in zoom array are strings, not numbers. maybe better to just compare min and max but there might be zooms levels between that don't have hexbins
      activeTags = 'zoom' + currentZoom + '_hexbin';
      console.log('centroid tags',activeTags)
    }
    else if (currentZoom > hexbinZoomMax) {
      // when you zoom in past hexbinZoomMax, maybe we want show the raw points? but showing hexbinZoomMax right now
//       scene_config.sources._xyzspace.url = `https://xyz.api.here.com/hub/spaces/${spaceId}/tile/web/{z}_{x}_{y}`;
//       activeTags = tagFilterQueryParam;
      activeTags = 'zoom' + hexbinZoomMax + '_hexbin';

      console.log(currentZoom + ">" + hexbinZoomMax);
    }
    else if (currentZoom < hexbinZoomMin) {
      // what should we do when we zoom out beyond the hexbinZoomMin? imagine 10 million points. show hexbinZoomMin for now
//       scene_config.sources._xyzspace.url = `https://xyz.api.here.com/hub/spaces/${spaceId}/tile/web/{z}_{x}_{y}`;
      activeTags = 'zoom' + hexbinZoomMin + '_hexbin'; // if in hexbin mode and zoomed way out, show what we've got
      console.log("beyond hexbin range, showing widest")
    }
//     activeTags = 'zoom13_hexbin';
  }
  else if (hexbins === 2 && Object.keys(hexbinInfo).length > 0) { // ensure hexbins info exists
    // drawing centroids
    var hexbinZoomArray = hexbinInfo.zoomLevels
    var hexbinZoomMax = Math.max(...hexbinZoomArray)
    var hexbinZoomMin = Math.min(...hexbinZoomArray)
    console.log(currentZoom,hexbinZoomMin,hexbinZoomMax,hexbinZoomArray)
    var overZoom = currentZoom + 1 //centroids fron one zoom level down look better

    if (hexbinZoomArray.includes(overZoom.toString())){ // hexbins in zoom array are strings, not numbers. maybe better to just compare min and max but there might be zooms levels between that don't have hexbins
      activeTags = 'zoom' + overZoom + '_centroid';
      console.log('centroid tags',activeTags)
    }
    else if (overZoom > hexbinZoomMax) {
      // when you zoom in past hexbinZoomMax, switch from centroids to raw points, need to switch back to original space (is this the best way?)
      scene_config.sources._xyzspace.url = `https://xyz.api.here.com/hub/spaces/${spaceId}/tile/web/{z}_{x}_{y}`;
      activeTags = tagFilterQueryParam;
      console.log(overZoom,">",hexbinZoomMax);
    }
    else if (overZoom < hexbinZoomMin) {
      // what should we do when we zoom out beyond the hexbinZoomMin? imagine 10 million points. show hexbinZoomMin for now
//       scene_config.sources._xyzspace.url = `https://xyz.api.here.com/hub/spaces/${spaceId}/tile/web/{z}_{x}_{y}`;
      activeTags = 'zoom' + hexbinZoomMin + '_centroid'; // if in hexbin mode and zoomed way out, show what we've got
      console.log("beyond hexbin range, showing widest")
    }
//     activeTags = 'zoom13_centroid';
  }

  scene_config.sources._xyzspace = scene_config.sources._xyzspace || {};
  scene_config.sources._xyzspace.url_params = {
    ...scene_config.sources._xyzspace.url_params,
    tags: activeTags
  };
  // remove tags param if no tags - do this after adding above, to ensure the full object path exists
  if (!activeTags) {
    delete scene_config.sources._xyzspace.url_params.tags;
  }
}

async function getStats({ spaceId, token, mapStartLocation }) {
  // Get stats endpoint
  var url = `https://xyz.api.here.com/hub/spaces/${spaceId}/statistics?access_token=${token}`;
  const stats = await fetch(url).then(r => r.json());
    // console.log(stats)
  if (stats.type == 'ErrorResponse'){
    console.log(stats.errorMessage);
    var error_response = stats.errorMessage;
    if (stats.errorMessage == "Unauthorized"){
      error_response = "Unauthorized: " + token + " is not a valid XYZ token"
    }
    if (stats.errorMessage == "The space with this ID does not exist."){
      error_response = "Error: XYZ space " + spaceId + " does not exist"
    }    
    alert(error_response); // old-school
    return
  }
  var bbox = stats.bbox.value
  console.log('map start location:', mapStartLocation)
  console.log('bbox',bbox)

  // check for all zero bbox
  if ((bbox[0] == 0) && (bbox[1] == 0) && (bbox[2] == 0) && (bbox[3] == 0)) {
    console.log('zeros')
    bbox = [-45, -45, 45, 45]
  }

  let fitBounds = false;
  if (mapStartLocation) {
    // if there is a map hashtag and it is outside the bbox, recenter, but if it's inside, keep that view
    if (mapStartLocation.lat < bbox[1] || mapStartLocation.lat > bbox[3] ||
        mapStartLocation.lng < bbox[0] || mapStartLocation.lng > bbox[2]) {
      console.log('map start location outside bbox');
      fitBounds = true;
    }
    else {
      map.setView([mapStartLocation.lat, mapStartLocation.lng], mapStartLocation.zoom);
    }
  }

  if (fitBounds) {
    const sw = L.latLng(bbox[1], bbox[0]);
    const ne = L.latLng(bbox[3], bbox[2]);
    const bounds = L.latLngBounds(sw, ne);
    map.fitBounds(bounds);
  }
  
  
  var spaceSize = (stats.byteSize) ? stats.byteSize.value : 0
  var spaceCount = (stats.count) ? stats.count.value : 0

  var calcSize = (spaceSize/1024/1024)
  console.log(spaceSize,'KB',calcSize,featureSize)

  if (calcSize < 1000) {
    calcSize = calcSize.toFixed(1) + ' MB'
  }
  else {
    calcSize = (spaceSize/1024/1024/1024).toFixed(1) + ' GB'
  }
  if (spaceSize > 0){
    var featureSize = spaceSize/spaceCount/1024 // KB per feature
    featureSize = featureSize.toFixed(1) + ' KB/feature'
  } else {
    calcSize = "n/a"
    featureSize = "n/a"
  }

  // Get property info
  const properties =
    ((stats.properties && stats.properties.value) || [])
      .reduce((props, p) => {
        props[p.key] = p;
        return props;
      }, {});

  // Get space endpoint
  var spaceURL = `https://xyz.api.here.com/hub/spaces/${spaceId}?access_token=${token}`;
  const spaceInfo = await fetch(spaceURL).then((response) => response.json());

  // updated document title
  document.title = document.title + " / " + spaceId + " / " + spaceInfo.title

  // check for hexbins, if they exist, create a hexbin object
  const hexbinInfo = {};
  if (spaceInfo.client) {
    if (spaceInfo.client.hexbinSpaceId) {
      hexbinInfo.spaceId = spaceInfo.client.hexbinSpaceId;
      const hexbinSpaceURL = `https://xyz.api.here.com/hub/spaces/${hexbinInfo.spaceId}?access_token=${token}`;
      try {
        const hexbinSpaceInfo = await fetch(hexbinSpaceURL).then((response) => response.json());
        hexbinInfo.zoomLevels = hexbinSpaceInfo.client.zoomLevels;
        hexbinInfo.cellSizes = hexbinSpaceInfo.client.cellSizes;
      } catch (e) { } // in case hexbin space doesn't exist or fails to load
    }
  }

  // calculate time since data was last written to the space
  let timeUnitsElapsed;
  if (spaceInfo.contentUpdatedAt) {
    const d = new Date();
    const timeNow = d.getTime();
    const contentUpdatedAt = new Date(spaceInfo.contentUpdatedAt);
    const secondsElapsed = (timeNow - contentUpdatedAt) / 1000;
    const minutesElapsed = Math.round(secondsElapsed / 60)
    const hoursElapsed = Math.round(secondsElapsed / 60 / 60)
    const daysElapsed = Math.round(secondsElapsed / 60 / 60 / 24)
    const weeksElapsed = Math.round(secondsElapsed / 60 / 60 / 24 / 7)
    const monthsElapsed = Math.round(secondsElapsed / 60 / 60 / 24 / 30)
    const yearsElapsed = (daysElapsed / 365).toFixed(1)
    const timeUnitsPrefix = "space last updated ";

    if (yearsElapsed > 1){
      timeUnitsElapsed = timeUnitsPrefix + yearsElapsed + " years ago"
    } else if (monthsElapsed > 1) {
      timeUnitsElapsed = timeUnitsPrefix + monthsElapsed + " months ago"
    } else if (weeksElapsed > 1) {
      timeUnitsElapsed = timeUnitsPrefix + weeksElapsed + " weeks ago"
    } else if (daysElapsed > 1) {
      timeUnitsElapsed = timeUnitsPrefix + daysElapsed + " days ago"
    } else if (hoursElapsed > 1) {
      timeUnitsElapsed = timeUnitsPrefix + hoursElapsed + " hours ago"
    } else if (minutesElapsed > 1) {
      timeUnitsElapsed = timeUnitsPrefix + minutesElapsed + " minutes ago"
    } else {
      timeUnitsElapsed = timeUnitsPrefix + Math.round(secondsElapsed) + " seconds ago"
    }
  };

  // update UI
  appUI.set({
    spaceInfo: {
      title: spaceInfo.title,
      description: spaceInfo.description,
      numFeatures: spaceCount,
      properties,
      dataSize: calcSize,
      featureSize: featureSize,
      updatedAt: timeUnitsElapsed
    },

    hexbinInfo,

    // seed with top tags from stats endpoint
    uniqueTagsSeen: new Set([...appUI.get().uniqueTagsSeen, ...stats.tags.value.map(t => t.key)].filter(x => x))
  });
}

// query Tangram viewport tiles, and update UI data (tag and property counts, etc.)
async function queryViewport() {
  const features = await scene.queryFeatures({ filter: { $source: '_xyzspace' }});
  console.log("features in viewport:", features.length);
  appUI.set({ featuresInViewport: features });
  updateViewportProperties(features);
}


function updateViewportTags(features) {  // for tags
  // grab the tags from Tangram's viewport tiles
  let tagsViewport = [];
  features.forEach(x => {
    if (x.properties['@ns:com:here:xyz']){ // check to see if there are xyz tags
      tagsViewport.push(...x.properties['@ns:com:here:xyz'].tags)
    }
  })

  const tagsWithCountsInViewport =
    Object.entries(
      features
        .flatMap(f => { 
          if (f.properties['@ns:com:here:xyz']){ // check to see if there are xyz tags
            f.properties['@ns:com:here:xyz'].tags
          }
        })
        .reduce((tagCounts, tag) => {
            tagCounts[tag] = tagCounts[tag] ? tagCounts[tag] + 1 : 1;
            return tagCounts;
          }, {}))
    .sort((a, b) => b[1] > a[1] ? 1 : (b[1] > a[1] ? -1 : 0));

  appUI.set({
    numFeaturesInViewport: features.length,
    tagsWithCountsInViewport
  });
}

function updateViewportProperties(features) { // for feature prop
  // then get feature values based on currently selected property
  const { featureProp } = appUI.get();
  const stats = calcFeaturePropertyStats(features, featureProp);

  // update UI
  appUI.set({
    featurePropCount: stats.uniqueCount,
    featurePropValueCounts: stats.sortedValueCounts,
    featurePropMin: stats.min,
    featurePropMax: stats.max,
    featurePropMedian: stats.median,
    featurePropMean: stats.mean,
    featurePropStdDev: stats.stdDev,
    featurePropSigma: stats.sigmaPercent,
    featurePropSigmaFloor: stats.sigmaFloor,
    featurePropSigmaCeiling: stats.sigmaCeiling
  });
}
