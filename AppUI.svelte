<svelte:window on:keydown="handleKeyPress(event)" />

<!-- Render full UI -->
<div id="controls_left" class="column">
  <div id="spaces" class="panel">
    <div id="space_info">
      {#if spaceInfo}
        <div>
          <!-- Demo/inspect mode toggle-->
          <button on:click="set({ demoMode: !demoMode })" class="demoModeToggle">
            {demoMode ? 'inspect' : 'demo'}
          </button>

          <!-- Space info -->
          <div>{spaceInfo.title}</div>
          {#if !demoMode}
            <div>{spaceId}: {spaceInfo.numFeatures.toLocaleString()} features, {spaceInfo.dataSize}, {spaceInfo.featureSize}</div>
            {#if spaceInfo.updatedAt}
              <div>{spaceInfo.updatedAt}</div>
            {/if}
            <div style="font-size:10px;">{spaceInfo.description}</div>
          {/if}
        </div>
      {:elseif !spaceLoading}
        <input type="text" placeholder="enter an XYZ space ID" bind:value='spaceId'>
        <input type="text" placeholder="enter an XYZ token" bind:value='token'>
        <button on:click="updateSpace(true)">Show XYZ Space</button>
      {/if}
    </div>
    <div id="style_info" class:hideInDemoMode="demoMode">
      {#if displayToggles}
        <table>
          <tr>
            <td style="color:blue;" on:click='toggleDisplayOption("roads")'>roads:</td>
            <td>{displayToggles.roads}</td>
            <td style="color:blue;" on:click='toggleDisplayOption("buildings")'>buildings:</td>
            <td>{displayToggles.buildings}</td>
            <td style="color:blue;" on:click='toggleDisplayOption("water")'>water:</td>
            <td>{displayToggles.water}</td>
            <td style="color:blue;" on:click='toggleDisplayOption("places")'>places:</td>
            <td>{displayToggles.places}</td>
          </tr>
          <tr>
            <td style="color:blue;" on:click='toggleDisplayOption("points")'>points:</td>
            <td>{displayToggles.points}</td>
            <td style="color:blue;" on:click='toggleDisplayOption("lines")'>lines:</td>
            <td>{displayToggles.lines}</td>
            <td style="color:blue;" on:click='toggleDisplayOption("outlines")'>outlines:</td>
            <td>{displayToggles.outlines}</td>
          </tr>
        </table>
        <table>
          <tr>
            <td style="color:blue;" on:click='toggleDisplayOption("clustering")'>clustering:</td>
            {#if displayToggles.clustering == 0}
            <td>
            {#if tokenCapabilities.hexbinClustering || tokenCapabilities.quadClustering}
             off
            {:else}
             Sign up for XYZ Pro to cluster
            {/if}
            </td>
            {#if displayToggles.clustering == 1}
            <td>H3 hexbins</td>
            {/if}
            {#if displayToggles.clustering == 2}
            <td>H3 hexbin centroids</td>
            {/if}
            {#if displayToggles.clustering == 3}
            <td>Quadbins</td>
            <td style="color:blue;" on:click='toggleDisplayOption("quadRez")'>resolution:</td>
            <td>{displayToggles.quadRez}</td>
            {/if}
          </tr>
        </table>
        {#if hexbinInfo.spaceId}
          <table>
              <tr>
                <td on:click='toggleDisplayOption("hexbins")'>CLI hexbins available: mode {displayToggles.hexbins}</td>
              </tr><tr>
                <td>{hexbinInfo.spaceId}, zoom {hexbinInfo.zoomLevels}</td>
              </tr>
          </table>
        {/if}

        <!-- Basemap selector -->
        basemap:
        <select bind:value="basemap" id="basemap_select">
          {#each Object.keys(basemaps) as basemap}
            <option value="{basemap}">{basemap}</option>
          {/each}
        </select>

        <!-- Export scene -->
        <button on:click="fire('exportScene')" style="float: right;">export</button>
      {/if}
    </div>

    <!-- Demo mode context -->
    {#if demoMode && displayToggles.label != null}
      <!-- Selected label property and value info -->
      <div style="margin: 5px 0px;">
        Features labeled by <b>{displayToggles.label}</b>
      </div>
    {/if}

    {#if demoMode && featurePointSizeProp != null}
      <!-- Selected point size property and value info -->
      <div style="margin: 5px 0px;">
        Points scaled by <b>{featurePointSizeProp}</b>
      </div>
    {/if}

    {#if demoMode && featureProp && featurePropCount != null}
      <!-- Selected feature property and value info -->
      <div style="margin: 5px 0px;">
        Analyzing property <b>{featureProp}</b> by <b>{displayToggles.vizMode}</b>
      </div>

      <!-- Histogram for demo mode -->
      {#if displayToggles.vizMode === 'range'}
        <div class="hideOnMobilePortrait">
          <FeaturePropHistogram
            showHeader={false}
            minFilter={featurePropMinFilter}
            maxFilter={featurePropMaxFilter}
            valueCounts={sortedFeaturePropValueCounts}
            valueColorFunction={featurePropValueColorFunction}
          />
        </div>
      {:elseif displayToggles.vizMode === 'rank' && featurePropValueCounts}
        <!-- Top values list -->
        <div class="hideOnMobilePortrait">
          <FeaturePropTopValues
            showHeader={false}
            prop={featureProp}
            bind:propValue="featurePropValue"
            bind:valueSort="featurePropValueSort"
            valueCounts={sortedFeaturePropValueCounts}
            valueColorFunction={featurePropValueColorFunction}
          />
        </div>
      {:elseif displayToggles.vizMode === 'property'}
        <!-- Top values list -->
        <div class="hideOnMobilePortrait">
          <FeaturePropTopValues
            showHeader={false}
            prop={featureProp}
            bind:propValue="featurePropValue"
            bind:valueSort="featurePropValueSort"
            valueCounts={sortedFeaturePropValueCounts}
            valueColorFunction={featurePropValueColorFunction}
          />
        </div>
      {/if}
    {/if}
  </div>

  <div id="viz" class="panel hideOnMobilePortrait" class:hideInDemoMode="demoMode">
    <div>
      <!-- Selected feature property stats -->
      {#if featureProp && featurePropCount != null}
        <div style="margin: 5px 0 5px 0;" class="hideOnMobile">
          <div>{featurePropCount} unique values in the viewport</div>

          {#if featurePropMin != null}
            <div>min: {featurePropMin}, median: {featurePropMedian}, max: {featurePropMax}</div>
            <div>
              μ: {featurePropMean.toFixed(2)},
              σ: {featurePropStdDev.toFixed(2)},
              {featurePropSigma.toFixed(2)}% ({featurePropSigmaFloor.toFixed(2)} - {featurePropSigmaCeiling.toFixed(2)})
            </div>
          {/if}
        </div>
      {/if}

      <!-- Color mode selector -->
      {#if displayToggles}
        <div>
          Analyze by
          <select bind:value="displayToggles.vizMode" on:change="updateFeaturePropValueSort()">
            {#each Object.keys(vizModes) as mode}
              {#if featureProp || !vizModeUsesProperty(mode)}
                <option value="{mode}">{vizModes[mode].label || mode}</option>
              {/if}
            {/each}
          </select>
        </div>
      {/if}

      {#if sortedUniqueFeaturePropsSeen.length > 0 && vizModeUsesProperty(displayToggles.vizMode)}
        <!-- Visualize property selector -->
        <div class="property_selector">
          <span style="flex: 0 0 auto; margin-right: 5px; width: 115px;">Visualize by property</span>
          <select style="flex: 1 1 auto; width: 100%;" bind:value="featureProp">
            <option value=""></option>
            <!-- JSON.stringify is a hint to help Svelte uniquely identify the object values -->
            <!-- see https://v2.svelte.dev/guide#keyed-each-blocks -->
            {#each sortedUniqueFeaturePropsSeen as [prop] (JSON.stringify(prop))}
              <option value="{prop}">{prop}</option>
            {/each}
          </select>
        </div>

        <!-- Filter value selector -->
        {#if featureProp && featurePropValueCounts}
          <div class="property_selector">
            <span style="flex: 0 0 auto; margin-right: 5px; width: 115px;">Filter by value</span>
            <select style="flex: 1 1 auto; width: 100%;" bind:value="featurePropValue">
              <option value=""></option>
              {#each featurePropValueCounts as [value, count]}
                <option value="{value}">({count}x) {value}</option>
              {/each}
            </select>
          </div>
        {/if}
      {/if}


      {#if featureProp && featurePropCount != null}
        <!-- Pattern selector -->
        {#if displayToggles}
          <div class="property_selector">
            <span style="flex: 0 0 auto; margin-right: 5px; width: 115px;">Pattern</span>
            <select style="flex: 1 1 auto; width: 100%;" bind:value="displayToggles.pattern">
              {#each patternOptions as pattern}
                <option value="{pattern}">{pattern}</option>
              {/each}
            </select>
          </div>

          {#if displayToggles.pattern}
            <div class="property_selector">
              <span style="flex: 0 0 auto; margin-right: 5px; width: 115px;">Pattern color</span>
              <input style="flex: 1 1 auto; width: 100%;" type="color" bind:value="displayToggles.patternColor">
            </div>
          {/if}
        {/if}

        <!-- Color palette and range filters -->
        {#if showFeaturePropPalette(displayToggles.vizMode)}
          <div class="hideOnMobile">
            Color palette
            <select bind:value="featurePropPaletteName">
              {#each Object.keys(colorPalettes) as palette}
                <option value="{palette}">{palette}</option>
              {/each}
            </select>

            <label>
              <input type="checkbox" bind:checked="featurePropPaletteFlip">
              Flip
            </label>
          </div>

          {#if featurePropMin != null}
            {#if useFeaturePropRangeLimit(displayToggles.vizMode)}
              <div>
                Limit values:
                <select bind:value="featurePropRangeFilter" on:change="updateFeaturePropRangeFilter(this.value)">
                  <option value="0">all</option>
                  <option value="4">sigma 4</option>
                  <option value="3">sigma 3</option>
                  <option value="2">sigma 2</option>
                  <option value="1">sigma 1</option>
                  <option value="custom" class="hideOnMobile">custom</option>
                </select>
                <input class="range_filter hideOnMobile" type="text" bind:value="featurePropMinFilterInput" placeholder="min" on:input="updateFeaturePropRangeFilter('custom')" on:keydown="event.stopPropagation()">
                <input class="range_filter hideOnMobile" type="text" bind:value="featurePropMaxFilterInput" placeholder="max" on:input="updateFeaturePropRangeFilter('custom')" on:keydown="event.stopPropagation()">
              </div>

              <label style="margin-bottom: 5px;">
                <input type="checkbox" bind:checked="featurePropHideOutliers">
                Hide values outside range
              </label>

              {#if featurePropMostlyNumeric}
                <FeaturePropHistogram
                  minFilter={featurePropMinFilter}
                  maxFilter={featurePropMaxFilter}
                  valueCounts={sortedFeaturePropValueCounts}
                  valueColorFunction={featurePropValueColorFunction}
                />
              {/if}
            {/if}
          {/if}
        {/if}
      {/if}
    </div>

    {#if sortedUniqueFeaturePropsSeen.length > 0}
      <!-- Label property selector -->
      <div class="property_selector">
        <span style="flex: 0 0 auto; margin-right: 5px; width: 115px;">Label features by</span>
        <select style="flex: 1 1 auto; width: 100%;" bind:value="displayToggles.label">
          <option value=""></option>
          {#each sortedUniqueFeaturePropsSeen as [prop]}
            <option value="{prop}">{prop}</option>
          {/each}
        </select>
      </div>

      <!-- Point size property selector -->
      <div class="property_selector">
        <span style="flex: 0 0 auto; margin-right: 5px; width: 115px;">Scale point size by</span>
        <select style="flex: 1 1 auto; width: 100%;" bind:value="featurePointSizeProp">
          <option value=""></option>
          {#each sortedUniqueFeaturePropsSeen as [prop]}
            <!-- {#if isPropNumeric(parsePropStack(prop), { featurePropTypesCache, featuresInViewport, featurePropNumericThreshold })} -->
              <option value="{prop}">{prop}</option>
            <!-- {/if} -->
          {/each}
        </select>
      </div>

      <!-- Point min/max pixel size -->
      {#if featurePointSizeProp}
        <div class="property_selector hideOnMobile">
          <span style="flex: 0 0 auto; margin-right: 5px; width: 115px;">Point size (px):</span>
          <input style="flex: 1 1 auto; width: 100%;" class="range_filter" type="text" bind:value="featurePointSizeDisplayRange[0]" placeholder="min" on:keydown="event.stopPropagation()">
          <input style="flex: 1 1 auto; width: 100%;" class="range_filter" type="text" bind:value="featurePointSizeDisplayRange[1]" placeholder="max" on:keydown="event.stopPropagation()">
        </div>
      {/if}
    {/if}

    {#if !(featureProp && featurePropCount != null)}
      Select a feature property to analyze, from the property list or by clicking on an individual feature.
    {/if}
    
    <!-- clustering property selector -->
    {#if sortedUniqueFeaturePropsSeen.length > 0 && displayToggles.clustering > 0}
      <div style="display: flex; flex-direction: row; align-items: center; margin: 5px 0px;">
        <span style="flex: 0 0 auto; margin-right: 5px;">Cluster features by</span>
        <select style="flex: 1 1 auto; width: 100%;" bind:value="displayToggles.clusteringProp">
          <option value=""></option>
          {#each sortedUniqueFeaturePropsSeen as [prop]}
            <option value="{prop}">{prop}</option>
          {/each}
        </select>
      </div>
    {/if}

    <!-- Top values list -->
    {#if featureProp && featurePropValueCounts}
      <div class="hideOnMobile">
        <FeaturePropTopValues
          prop={featureProp}
          bind:propValue="featurePropValue"
          bind:valueSort="featurePropValueSort"
          valueCounts={sortedFeaturePropValueCounts}
          valueColorFunction={featurePropValueColorFunction}
        />
      </div>
    {/if}
  </div>
</div>

<div id="controls_right" class="column hideOnMobile" class:hideInDemoMode="demoMode">
  <div id="tag_summary" class="panel">
    <table id="tag_stats">
      {#if featuresInViewport.length}
        <tr><td>features in viewport</td><td>{featuresInViewport.length}</td></tr>
      {/if}
      {#if numFeatureTagsInViewport != null}
        <tr><td>feature tags in viewport</td><td>{numFeatureTagsInViewport}</td></tr>
      {/if}
      <tr><td>unique tags in viewport</td><td>{uniqueTagsInViewport.size}</td></tr>
      <tr><td>unique tags seen</td><td>{uniqueTagsSeen.size}</td></tr>
    </table>
    <div id="tags_filtered">
      filtering by tags:<br>
      {#if tagFilterList.length > 0}
        {tagFilterList.join(', ')}<br><br>
      {:else}
        <i>no tags filtered<br><br></i>
      {/if}
    </div>
    <div style="color:blue;" id="clear_filters" on:click="set({ tagFilterList: [] })">CLEAR TAG FILTERS</div>
    <div id="and_or">
      <input type="radio" g="and_or" value="or" bind:group='tagFilterAndOr'>or
      <input type="radio" name="and_or" value="and" bind:group='tagFilterAndOr'>and<br>
    </div>
  </div>
  <div id="tag_panel" class="panel">
    <span style="color:blue;" on:click="toggleTagFilterViewport()">
      {#if tagFilterViewport}
        [show all tags seen]
      {:else}
        [only show tags in view]
      {/if}
    </span>
    <span style="color:blue;" on:click="toggleTagFilterAt()">
      {#if tagFilterAt}
        [show all tag names]
      {:else}
        [only show @ tags]
      {/if}
    </span>
    <span style="color:blue;" on:click="toggleTagSort()">
      [sort by {nextTagSort}]
    </span>
    <div id="tags">
      <div>
        <input id="tag_search" type="text" bind:value="tagFilterSearch" placeholder="Filter tags" on:keydown="event.stopPropagation()">
      </div>

      <!-- The JSON.stringify gives Svelte a way to uniquely identify the full tag info.
        This ensures that the correct checkboxes stay checked when the list is re-ordered
        (for instance when tag counts change). See https://svelte.technology/guide#keyed-each-blocks.
      -->
      {#each tagDisplayList.slice(0, 500) as tag (JSON.stringify(tag))}
        <label>
          <input type="checkbox" value="{tag[0]}" bind:group='tagFilterList'>
          ({tag[1]}x) {tag[0]}
        </label>
        <br>
      {/each}

      {#if tagDisplayList.length > 500}
        <i>Displaying the top 500 tags of {tagDisplayList.length} total</i>
      {/if}
    </div>
  </div>

  <!-- property search UI-->
  {#if spaceInfo && spaceInfo.properties}
    <div id="properties" class="panel hideOnMobile">
      <PropertySearchList
        properties={spaceInfo.properties}
        bind:propertySearch="propertySearch"
      />
    </div>
  {/if}
</div>

<!-- feature popup content, hidden in the main UI and synced to the Leaflet popup -->
<div style="display: none">
  <div id="popupContent" style="margin-top: 18px;">
    <FeaturePopup
      feature={feature}
      featureProp={featureProp}
      featurePinned={featurePinned}
      featurePropValue={featurePropValue}
      on:selectProp="setFeatureProp({
        featureProp: (event.prop !== featureProp ? event.prop : null),
        featurePropValue: ''
      })"
      on:selectValue="setFeatureProp({
        featureProp: event.prop,
        featurePropValue: (event.value !== featurePropValue ? event.value : '')
      })"
    />
  </div>
</div>

<script>

import { basemaps, getBasemapScene, getBasemapName, getDefaultBasemapName, getNextBasemap } from './basemaps';
import { colorPalettes } from './colorPalettes';
import { vizModes, vizHelpers } from './vizModes';
import { displayOptions, defaultDisplayOptionValue } from './displayOptions';
import { calcFeaturePropertyStats } from './stats';
import { parseNestedObject, parsePropStack, formatPropStack, parseNumber, mostlyNumeric, lookupProperty, PROP_TYPES } from './utils';

export default {
  data() {
    return {
      // set these to empty strings (not null) to get placeholder text in input
      spaceId: '',
      token: '',
      spaceInfo: null,
      hexbinInfo: {},
      demoMode: false, // display collapsed UI demo mode
      feature: null,
      featureProp: null,
      featurePropValue: '',
      featurePropCount: null,
      featurePropValueCounts: null,
      featurePropValueSort: 'count',
      featurePropNumericThreshold: 80, // minimum % of values that must be numeric to support range, etc.
      featurePropCheckNumeric: null, // the property name that was active when we last checked for numeric-ness
      featurePropPaletteName: 'viridis', // TODO: move palette to import
      featurePropPaletteFlip: false,
      featurePropMin: null,
      featurePropMax: null,
      featurePropMinFilterInput: '', // use empty string to get input placeholder
      featurePropMaxFilterInput: '', // use empty string to get input placeholder
      featurePropMean: null,
      featurePropMedian: null,
      featurePropStdDev: null,
      featurePropSigma: null,
      featurePropSigmaFloor: null,
      featurePropSigmaCeiling: null,
      featurePointSizeDisplayRange: [4, 20],
      featurePointSizeProp: '', // setting this to null breaks the point toggle
      
      clustering: null,
      quadCountmode: null,
      quadRez: 4,

      tagsWithCountsInViewport: [],
      tagFilterList: [],
      tagFilterAndOr: 'or',
      tagFilterViewport: false,
      tagFilterAt: false,
      tagSort: 'count',
      tagFilterSearch: '', // set these to empty strings (not null) to get placeholder text in input
      propertySearch: {},
      propertySearchOverride: null,

      featuresInViewport: [],
      featurePropTypesCache: {}, // cache of inferred feature property types
      uniqueTagsSeen: new Set(),

      uniqueFeaturePropsSeen: new Map(),

      displayToggles: null,
      vizModes, // need to reference here to make accessible to templates and tangram functions
      colorPalettes, // need to reference here to make accessible to templates and tangram functions
      vizHelpers, // need to reference here to make accessible to templates and tangram functions
      basemaps, // need to reference here to make accessible to templates
    }
  },

  components: {
    FeaturePropHistogram: './FeaturePropHistogram.svelte',
    FeaturePropTopValues: './FeaturePropTopValues.svelte',
    FeaturePopup: './FeaturePopup.svelte',
    PropertySearchList: './PropertySearchList.svelte'
  },

  computed: {
    basemapScene: ({ basemap }) => {
      const scene = getBasemapScene(basemap);
      if (scene) {
        scene.global = {
          ...scene.global,
          vizModes
        };
      }
      return scene;
    },

    // apply range filters if needed
    featurePropMinFilter: ({ displayToggles, featurePropMin, featurePropMinFilterInput }) => {
      // only use if color mode supports range filter
      if (displayToggles && useFeaturePropRangeLimit(displayToggles.vizMode)) {
        const val = parseNumber(featurePropMinFilterInput);
        if (typeof val === 'number' && !isNaN(val)) {
          return val;
        }
      }
      return featurePropMin;
    },

    featurePropMaxFilter: ({ displayToggles, featurePropMax, featurePropMaxFilterInput }) => {
      // only use if color mode supports range filter
      if (displayToggles && useFeaturePropRangeLimit(displayToggles.vizMode)) {
        const val = parseNumber(featurePropMaxFilterInput);
        if (typeof val === 'number' && !isNaN(val)) {
          return val;
        }
      }
      return featurePropMax;
    },

    featurePropRows: ({ feature }) => feature && parseNestedObject(feature.properties),

    featurePropPalette: ({ featurePropPaletteName }) => {
      return colorPalettes[featurePropPaletteName];
    },

    // update stats for current features and point size property (if one selected)
    featurePointSizePropStats: ({ featuresInViewport, featurePointSizeProp }) => {
      return calcFeaturePropertyStats(featuresInViewport, featurePointSizeProp);
    },

    // how point sizes are mapped to feature property values
    featurePointSizeRange: ({ featurePointSizePropStats, featurePointSizeDisplayRange }) => {
      return [
        // value range for features in viewport
        featurePointSizePropStats.min, featurePointSizePropStats.max,
        // pixel size range to map these to
        parseFloat(featurePointSizeDisplayRange[0]) || 5, parseFloat(featurePointSizeDisplayRange[1]) || 20
      ];
    },

    sortedFeaturePropValueCounts: ({ featurePropValueCounts, featurePropValueSort }) => {
      if (!featurePropValueCounts) {
        return [];
      }

      if (featurePropValueSort === 'values') {
        // copy and re-sort on value (descending) if needed
        return Array.from(featurePropValueCounts).sort((a, b) => {
          // try to get a number
          let an = parseNumber(a[0]);
          let bn = parseNumber(b[0]);

          // sort nulls and NaNs to the bottom
          an = (an == null || isNaN(an)) ? -Infinity : an;
          bn = (bn == null || isNaN(bn)) ? -Infinity : bn;

          return bn - an; // descending sort
        });
      }
      return featurePropValueCounts; // return original/unmodified values
    },

    // function to calculate color for a feature prop value, based on current selection state
    featurePropValueColorFunction: ({
      displayToggles,
      featurePropMinFilter, featurePropMaxFilter,
      featurePropPalette, featurePropPaletteFlip, featurePropValueCounts, vizHelpers }) => {

      return (value) => {
        const vizMode = displayToggles.vizMode;
        if (vizModes[vizMode] && vizModes[vizMode].color) {
          return vizModes[vizMode].color(
            value, {
              displayToggles,
              featurePropMinFilter, featurePropMaxFilter,
              featurePropPalette, featurePropPaletteFlip, featurePropValueCounts,
              vizHelpers
            }
          );
        }
        return 'rgba(127, 127, 127, .25)'; // color for null values?

      };
    },

    featurePropMostlyNumeric: ({ featureProp, featurePropTypesCache, featuresInViewport, featurePropNumericThreshold }) => {
      return isPropNumeric(featureProp, { featurePropTypesCache, featuresInViewport, featurePropNumericThreshold });
    },

    featurePropValueCountHash: ({ featurePropValueCounts }) => featurePropValueCounts && hashString(JSON.stringify(featurePropValueCounts)),

    nextTagSort: ({ tagSort }) => (tagSort === 'count' ? 'name' : 'count'),

    tagsWithCountsInViewport: ({ featuresInViewport }) => {
      // grab the tags from Tangram's viewport tiles
      let tagsViewport = [];
      featuresInViewport.forEach(x => {
        if (x.properties['@ns:com:here:xyz'] && x.properties['@ns:com:here:xyz'].tags) {
          tagsViewport.push(...x.properties['@ns:com:here:xyz'].tags);
        }
      })

      const tagsWithCountsInViewport =
        Object.entries(
          featuresInViewport
            .filter(f => f.properties['@ns:com:here:xyz'] && f.properties['@ns:com:here:xyz'].tags)
            .flatMap(f => f.properties['@ns:com:here:xyz'].tags)
            .reduce((tagCounts, tag) => {
                tagCounts[tag] = tagCounts[tag] ? tagCounts[tag] + 1 : 1;
                return tagCounts;
              }, {}))
        .sort((a, b) => b[1] > a[1] ? 1 : (b[1] > a[1] ? -1 : 0));
      return tagsWithCountsInViewport;
    },

    uniqueTagsInViewport: ({ tagsWithCountsInViewport }) => new Set(tagsWithCountsInViewport.map(v => v[0])),

    sortedUniqueFeaturePropsSeen: ({ uniqueFeaturePropsSeen }) => {
      // alphabetical sort, but with @ properties at bottom
      return Array.from(uniqueFeaturePropsSeen.keys())
        .sort((a, b) => a[0] === '@' ? 1 : b[0] === '@' ? -1 : a[0] > b[0] ? 1 : a[0] < b[0] ? -1 : 0)
        .map(prop => [prop, uniqueFeaturePropsSeen.get(prop)]);
    },

    numFeatureTagsInViewport: ({ tagsWithCountsInViewport }) => tagsWithCountsInViewport.reduce((acc, cur) => acc + cur[1], 0),

    // build the list of tags for display with checkboxes
    tagDisplayList: ({ tagsWithCountsInViewport, tagSort, tagFilterList, tagFilterViewport, tagFilterAt, tagFilterSearch, uniqueTagsSeen }) => {
      const tagCountMap = new Map();

      // optional filters
      // e.g. remove tags without an @ if desired, or text search
      const tagFilterFunc = tag => {
        const at = tagFilterAt ? tag.includes('@') : true;
        const search = (tagFilterSearch && tagFilterSearch.length >= 3) ? tag.includes(tagFilterSearch) : true;
        return (at && search) || tagFilterList.indexOf(tag) > -1; // always include selected tags
      };

      // add any tags that are selected, but not currently in the viewport
      // this also handles cases where an impossible tag combo is selected (postcode 98125 AND postcode 98122),
      // but we want those tags to still show up in the list so they can be de-selected
      // note this ignores filters to ensure these tags can always be seen/de-selected
      tagFilterList.forEach(tag => tagCountMap.set(tag, 0));

      // add all uniquely seen tags that aren't currently in the viewport
      if (!tagFilterViewport) {
        uniqueTagsSeen
          .forEach(tag => {
            if (tagFilterFunc(tag)) {
              tagCountMap.set(tag, 0);
            }
          });
      }

      // add tags currently in the viewport
      tagsWithCountsInViewport
        .filter(([tag]) => tagFilterFunc(tag))
        .forEach(([tag, count]) => tagCountMap.set(tag, count));

      // convert to array entries for sorting
      let tagCounts = [...tagCountMap.entries()];

      // sort tags as desired
      if (tagSort === 'name') {
        tagCounts.sort((a, b) => {
          if (a[0] === b[0]) {
            return a[1] < b[1] ? 1 : -1;
          }
          return a[0] < b[0] ? 1 : (a[0] > b[0] ? -1 : 0);
        });
      }
      else if (tagSort === 'count') {
        tagCounts.sort((a, b) => {
          if (a[1] === b[1]) {
            return a[0] < b[0] ? 1 : (a[0] > b[0] ? -1 : 0);
          }
          return a[1] < b[1] ? 1 : -1;
        });
      }

      return tagCounts;
    },

    // format selected tags as a query parameter for XYZ tile requests
    tagFilterQueryParam: ({ tagFilterList, tagFilterAndOr }) => {
      if (tagFilterList.length === 0) {
        return null;
      }

      if (tagFilterAndOr === 'and') {
        return tagFilterList.join('+');
      }
      else {
        return tagFilterList.join(',');
      }
    },

    // format property searches as query parameters for XYZ tile requests
    propertySearchQueryParams: ({ propertySearch }) => {
      return Object.entries(propertySearch)
        .reduce((params, [prop, { op, equals, min, max }]) => {
          const p = `p.${prop}`;
          if (op === 'equals' && equals) {
            params.push([p, equals]);
          }
          else if (op === 'range') {
            min = parseFloat(min);
            max = parseFloat(max);

            if (typeof min === 'number' && !isNaN(min)) {
              params.push([p, `gt=${min}`]);
            }

            if (typeof max === 'number' && !isNaN(max)) {
              params.push([p, `lt=${max}`]);
            }
          }
          return params;
        }, []);
    },

    queryParams: ({
        spaceId, token, basemap,
        demoMode,
        displayToggles,
        featureProp,
        featurePropValue,
        featurePropPaletteName, featurePropPaletteFlip,
        featurePropRangeFilter,
        featurePropMinFilterInput,
        featurePropMaxFilterInput,
        featurePropValueSort,
        featurePropHideOutliers,
        featurePointSizeProp,
        featurePointSizeDisplayRange,
        tagFilterQueryParam,
        propertySearch
      }) => {

      const params = new URLSearchParams();

      if (spaceId) {
        params.set('space', spaceId);
      }

      if (token) {
        params.set('token', token);
      }

      params.set('basemap', basemap);

      params.set('demo', demoMode ? 1 : 0);

      for(const p in displayToggles) {
        if (displayToggles[p] != null) {
          params.set(p, displayToggles[p]);
        }
      }

      if (tagFilterQueryParam) {
        params.set('tags', tagFilterQueryParam);
      }

      if (featureProp) {
        params.set('property', featureProp);
      }

      if (featurePropValue) {
        params.set('value', featurePropValue);
      }

      params.set('palette', featurePropPaletteName);
      params.set('paletteFlip', featurePropPaletteFlip);

      // save range filter (if current color mode supports it)
      if (featurePropRangeFilter && displayToggles && useFeaturePropRangeLimit(displayToggles.vizMode)) {
        params.set('rangeFilter', featurePropRangeFilter);
        if (featurePropRangeFilter === 'custom') {
          params.set('rangeFilterMin', featurePropMinFilterInput);
          params.set('rangeFilterMax', featurePropMaxFilterInput);
        }
      }

      params.set('sort', featurePropValueSort);
      params.set('hideOutliers', featurePropHideOutliers);

      params.set('pointSizeProp', featurePointSizeProp);
      params.set('pointSizeRange', JSON.stringify(featurePointSizeDisplayRange));

      params.set('propertySearch', JSON.stringify(propertySearch));

      return params;
    }

  },

  onstate({ changed, current, previous }) {
    // update globally seen tags
    if (changed.uniqueTagsInViewport) {
      this.set({
        uniqueTagsSeen: new Set([...current.uniqueTagsSeen, ...current.uniqueTagsInViewport].filter(x => x))
      });
    }

    // check if globally seen properties need to be updated
    const uniqueFeaturePropsSeen = new Map(current.uniqueFeaturePropsSeen); // get currently known props
    let updateUniqueFeaturePropsSeen = false;

    // seed globally seen properties from space stats
    if (changed.spaceInfo && current.spaceInfo) {

      Object.entries(current.spaceInfo.properties)
        .forEach(([prop, value]) => {
          const propStack = prop.split(':'); // XYZ API uses ':' delimiter
          prop = formatPropStack(propStack);
          uniqueFeaturePropsSeen.set(prop, {
            ...value,
            propStack
          });
        });
      updateUniqueFeaturePropsSeen = true;
    }

    // update globally seen properties from current feature set
    if (changed.featuresInViewport) {
      current.featuresInViewport.forEach(feature => {
        parseNestedObject(feature.properties)
          .filter(p => !p.prop.startsWith('$')) // don't include special tangram context properties
          .filter(p => !uniqueFeaturePropsSeen.has(p.prop)) // skip properties we already know about
          .forEach(p => {
            uniqueFeaturePropsSeen.set(p.prop, { propStack: p.propStack }); // add new props
          });
      });
      updateUniqueFeaturePropsSeen = true;

      // reset property type cache (re-evaluatate property types when new features are available)
      this.set({ featurePropTypesCache: {} });
    }

    // update feature props if needed
    if (updateUniqueFeaturePropsSeen) {
      this.set({ uniqueFeaturePropsSeen });
    }

    // Apply Tangram scene updates based on state change
    if (current.spaceInfo &&
        (changed.basemapScene || changed.spaceInfo)) {
      this.fire('loadScene', current);
    }

    if (changed.displayToggles ||
        changed.tagFilterQueryParam ||
        changed.propertySearchQueryParams ||
        changed.hexbinInfo ||
        changed.featureProp ||
        changed.featurePropValue ||
        changed.featurePointSizeProp ||
        changed.featurePointSizeDisplayRange ||
        changed.featurePropPalette ||
        changed.featurePropPaletteFlip ||
        changed.featurePropValueCountHash ||
        changed.featurePropMinFilter ||
        changed.featurePropMaxFilter ||
        changed.featurePropHideOutliers) {
      this.fire('updateScene', current);
    }

    // mark space as loaded
    // used to hide UI during load (maybe replace with promise)
    if (changed.spaceInfo && current.spaceInfo) {
      this.set({
        spaceLoading: false
      });
    }

    // update query string as needed
    if (changed.queryParams) {
      this.fire('updateQueryString', current);
    }
  },

  onupdate({ changed, current, previous }) {
    // note: svelte needs these checks in onupdate instead of onstate because of interdependencies when
    // calling a set() from inside onstate that triggers another set(); these issues are reportedly fixed in v3,
    // separating this check out into onupdate for now

    // reset range filter to 'all' when selected property changes
    if (changed.featureProp && previous && previous.featureProp && current.featurePropRangeFilter === 'custom') {
      this.updateFeaturePropRangeFilter(0); // zero = use all values / no range limiting
    }
    // update range filter when underlying data changes
    else if (changed.featurePropMin || changed.featurePropMax) {
      this.updateFeaturePropRangeFilter();
    }

    // additional checks when feature property values update
    if (changed.featurePropValueCountHash &&
        current.displayToggles != null &&
        current.featurePropCheckNumeric !== current.featureProp) {

        // if color 'range' mode is active, check if values are sufficiently numeric, and if so,
        // automatically switch to 'rank' mode instead (no use using range controls for non-numeric data)
        let vizMode = current.displayToggles.vizMode;
        if (!current.featurePropMostlyNumeric && vizMode === 'range') {
          vizMode = 'rank';
        }
        // or the converse
        else if (current.featurePropMostlyNumeric && vizMode === 'rank') {
          vizMode = 'range';
        }

        this.set({
          featurePropCheckNumeric: current.featureProp, // record that we last ran the check for this property name
          displayToggles: { ...current.displayToggles, vizMode }
        });
        this.updateFeaturePropValueSort();
    }

    // tell map to update popup content when it changes
    // (this is in svelte onupdate because it fires after the DOM has been updated with new content)
    if (changed.feature ||
        changed.featureProp ||
        changed.featureProp ||
        changed.featurePinned) {
      if (current.feature) {
        this.fire('updatePopup');
      }
    }
  },

  methods: {
    setFromQueryParams(params) {
      // convert query params to object
      params = [...params.entries()].reduce((p, [k, v]) => { p[k] = v; return p; }, {});

      // set these to empty strings (not null) to get placeholder text in input
      const spaceId = params.space || '';
      const token = params.token || '';
      const demoMode = (parseInt(params.demo) === 1);

      // parse out display option toggles
      const displayToggles = {};
      params.vizMode = params.vizMode || params.colors; // backwards compatibility for `colors` parameter
      for (const p in params) {
        if (displayOptions[p]) {
          if (displayOptions[p].parse) {
            // parse display options values (e.g. convert strings to numbers, etc.)
            displayToggles[p] = displayOptions[p].parse(params[p]);
          }
          else if (params[p] !== 'null' && params[p] !== 'undefined') {
            displayToggles[p] = params[p];
          }
        }
      }

      // set default values for display options
      for (const p in displayOptions) {
        if (displayToggles[p] == null) {
          displayToggles[p] = defaultDisplayOptionValue(p);
        }
      }

      // parse tags
      let tagFilterList = [];
      let tagFilterAndOr = this.get().tagFilterAndOr;
      if (params.tags) {
        // look for OR tags
        if (params.tags.includes(',')) {
          tagFilterList = params.tags.split(',');
          tagFilterAndOr = 'or';
        }
        // look for AND tags
        // if (params.tags.includes('+')) {
        else {
          tagFilterList = params.tags.split('+');
          tagFilterAndOr = 'and';
        }
      }

      let basemap = getBasemapName(params.basemap);
      if (!getBasemapScene(basemap)) {
        basemap = getDefaultBasemapName();
      }

      // parse selected feature property
      const featureProp = params.property;

      // parse selected property value
      let featurePropValue = params.value === undefined ? '' : params.value;
      if (featurePropValue && featurePropValue.match(/^\d+$/)) {
        featurePropValue = parseNumber(featurePropValue); // parse from string if needed
      }

      // parse color palette
      const featurePropPaletteFlip = (params.paletteFlip === 'true');
      let featurePropPaletteName = this.get().featurePropPaletteName;
      if (colorPalettes[params.palette]) {
        featurePropPaletteName = params.palette;
      }

      // parse min/max range filter
      const featurePropRangeFilter = params.rangeFilter;
      let { featurePropMinFilterInput, featurePropMaxFilterInput } = this.get();
      if (featurePropRangeFilter === 'custom') {
        featurePropMinFilterInput = params.rangeFilterMin;
        featurePropMaxFilterInput = params.rangeFilterMax;
      }

      const featurePropValueSort = params.sort || 'count';
      const featurePropHideOutliers = (params.hideOutliers === 'true');

      const featurePointSizeProp = params.pointSizeProp;
      let featurePointSizeDisplayRange = this.get().featurePointSizeDisplayRange;
      try { // protect against JSON.parse failure (it's brittle with string input)
        featurePointSizeDisplayRange = JSON.parse(params.pointSizeRange);
      } catch(e) {}

      let propertySearch = {};
      try { // protect against JSON.parse failure (it's brittle with string input)
        propertySearch = JSON.parse(params.propertySearch);
      } catch(e) {}

      // set all params
      this.set({
        spaceId,
        token,
        basemap,
        demoMode,
        displayToggles,
        featureProp,
        featurePropValue,
        featurePropPaletteName,
        featurePropPaletteFlip,
        featurePropRangeFilter,
        featurePropMinFilterInput,
        featurePropMaxFilterInput,
        featurePropValueSort,
        featurePropHideOutliers,
        featurePointSizeProp,
        featurePointSizeDisplayRange,
        tagFilterList,
        tagFilterAndOr,
        propertySearch
      });

      this.updateSpace(false);
      this.updateFeaturePropRangeFilter();
      if (featurePropValueSort == null) {
        this.updateFeaturePropValueSort();
      }
    },

    updateSpace(loadScene) {
      const { spaceId, token, basemapScene } = this.get();

      if (spaceId && token) {
        this.set({
          spaceLoading: true, // used to hide UI during load (maybe replace with promise)
          uniqueTagsSeen: new Set() // reset unique tags when loading new space
        });

        this.fire('loadSpace', {
          spaceId,
          token
        });

        if (loadScene) {
          this.fire('loadScene', {
            basemapScene
          });
        }
      }
    },

    setFeatureProp({ featureProp, featurePropValue }) {
      // if selecting a feature property and current color mode isn't property-specific,
      // automatically change to the 'property' color mode
      const displayToggles = this.get().displayToggles;
      let vizMode = displayToggles.vizMode;
      if (vizModes[vizMode] && !vizModes[vizMode].useProperty) {
        vizMode = 'property';
      }

      this.set({
        featureProp,
        featurePropValue,
        displayToggles: { ...displayToggles, vizMode }
      });
    },

    updateFeaturePropValueSort() {
      // set default sort type (if there is one) for feature property color mode
      const displayToggles = this.get().displayToggles;
      let vizMode = displayToggles.vizMode;
      if (vizModes[vizMode] && vizModes[vizMode].defaultSort) {
        this.set({ featurePropValueSort: vizModes[vizMode].defaultSort });
      }
    },

    updateFeaturePropRangeFilter(filter = null) {
      const {
        featurePropRangeFilter,
        featurePropMin,
        featurePropMax,
        featurePropMean,
        featurePropStdDev
      } = this.get();

      // update filter type if one specified, or keep existing
      if (filter == null) {
        filter = featurePropRangeFilter; // use existing filter
      }
      else {
        this.set({
          featurePropRangeFilter: filter.toString() // set new filter
        });
      }

      // derive min/max values if needed (values specified manually in custom mode)
      if (filter !== 'custom') {
        const sigmaFilter = parseInt(filter);

        if (typeof sigmaFilter === 'number' && sigmaFilter > 0 &&
            featurePropMin != null && featurePropMax != null) { // require a min/max to be set
          const min = Math.max(featurePropMin, parseFloat((featurePropMean - (featurePropStdDev * sigmaFilter)).toFixed(2)));
          const max = Math.min(featurePropMax, parseFloat((featurePropMean + (featurePropStdDev * sigmaFilter)).toFixed(2)));

          this.set({
            featurePropMinFilterInput: min, featurePropMaxFilterInput: max
          });
        }
        else { // no filter / "all"
          this.set({
            featurePropMinFilterInput: featurePropMin, featurePropMaxFilterInput: featurePropMax
          });
        }
      }
    },

    toggleDisplayOption(prop) {
      const displayToggles = this.get().displayToggles;

      const vals = displayOptions[prop] && displayOptions[prop].values;
      if (vals) {
        const i = vals.indexOf(displayToggles[prop]);
        if (i > -1) {
          displayToggles[prop] = vals[(i + 1) % vals.length];
        }
        else {
          displayToggles[prop] = vals[0];
        }
      }

      this.set({ displayToggles });
    },

    toggleTagSort() {
      this.set({ tagSort: this.get().nextTagSort });
    },

    toggleTagFilterViewport() {
      this.set({ tagFilterViewport: !this.get().tagFilterViewport })
    },

    toggleTagFilterAt() {
      this.set({ tagFilterAt: !this.get().tagFilterAt })
    },

    handleKeyPress({ key }) {
      // b = toggle buildings
      // l = line width
      // n = names on map
      // o = toggle polygon outlines
      // p = make dots bigger
      // r = toggle roads
      // s = make dots smaller and lines narrower
      // w = put polygons under water

      if (key == "m") { // toggle basemap
        this.set({ basemap: getNextBasemap(this.get().basemap) });
      }
      else {
        if (key == "b") { // toggle buildings
          this.toggleDisplayOption('buildings');
        }
        else if (key == "l") { // make lines smaller
          this.toggleDisplayOption('lines');
        }
        else if (key == "n") { // hide places
          this.toggleDisplayOption('places');
        }
        else if (key == "o") { // toggle outlines
          this.toggleDisplayOption('outlines');
        }
        else if (key == "p") { // change point size
          this.toggleDisplayOption('points');
        }
        else if (key == "v") { // toggle roads -- v for via! (changed from r because of cmd-r reload)
          this.toggleDisplayOption('roads');
        }
        else if (key == "w") { // put polygons under water
          this.toggleDisplayOption('water');
        }
        else if (key == "x") { // toggle hexbins, centroids, (and raw data?)
          this.toggleDisplayOption('hexbins');
        }
        else if (key == "k") { // toggle server-side clustering
          this.toggleDisplayOption('clustering');
        }        
      }
    }

  },

  helpers: {
    vizModeUsesProperty(mode) {
      return vizModes[mode] && vizModes[mode].useProperty;
    },

    showFeaturePropPalette(mode) {
      return vizModes[mode] && vizModes[mode].usePalette;
    },

    patternOptions: displayOptions.pattern.values, // for easier template access

    // references here make these available to as template helper
    useFeaturePropRangeLimit,
    // isPropNumeric
  }
}

// calculate whether a property is numeric based on the current features in the viewport, and cache the result
function isPropNumeric(prop, { featurePropTypesCache, featuresInViewport, featurePropNumericThreshold }) {
  const propStack = parsePropStack(prop);
  if (featurePropTypesCache[prop] == null) {
    // use a set to get unique values from array
    const propValues = new Set(featuresInViewport
      .map(f => lookupProperty(f.properties, propStack))
      .filter(f => typeof f !== 'object')
    );
    featurePropTypesCache[prop] =
      mostlyNumeric([...propValues], featurePropNumericThreshold) ? PROP_TYPES.NUMERIC : PROP_TYPES.STRING;
  }
  return featurePropTypesCache[prop] === PROP_TYPES.NUMERIC;
}

function useFeaturePropRangeLimit(vizMode) {
  return vizModes[vizMode] && vizModes[vizMode].limitRange;
}

function formatFeaturePropValueColor(state, value) {
  const vizMode = state.displayToggles.vizMode;
  if (vizModes[vizMode] && vizModes[vizMode].color) {
    return vizModes[vizMode].color(value, state);
  }
  return 'rgba(127, 127, 127, .25)';
}

function hashString (string) {
    var hash = 0, i, chr, len;

    if (string.length === 0) {
        return hash;
    }

    for (i = 0, len = string.length; i < len; i++) {
        chr   = string.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

</script>

<style>

  .column {
    position: absolute;
    z-index: 1000;
    min-height: 100vh;
    max-height: 100vh;
    display: flex;
    flex-direction: column;
    width: 300px;
  }

  .panel {
    margin: 5px;
    padding: 5px;
    background-color: rgba(200, 200, 200, 0.75);
    border: 1px solid black;
    border-radius: 3px;
    color: black;
    box-shadow: 2px 2px 2px black;
  }

  #space_info {
    /* for long space descriptions */
    /* overflow-x: auto; */
    overflow-wrap: break-word;
  }

  #properties {
    overflow: auto;
    height: 150vh;
    flex: 1 1 auto;
  }

  #properties table {
    width: 100%;
  }

  #properties tr.active {
    background-color: lightyellow;
  }

  #viz {
    overflow: auto;
    flex: 1 1 auto;
    height: 20vh;
  }

  #controls_right {
    right: 0;
  }

  .hideInDemoMode {
    display: none !important;
  }

  #tag_panel {
    overflow: auto;
    flex: 1 1 150vh;
  }

  #tag_search {
    width: calc(100% - 8px);
    margin: 4px 0px;
    padding: 2px;
  }

  .range_filter {
    width: 45px;
  }

  .property_selector {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin: 5px 0px;
  }

  .active {
    background-color: lightyellow; padding: 3px;
  }

  .demoModeToggle {
    /* position: absolute; */
    /* right: 10px; */
    /* top: 10px; */
    /* z-index: 1001; */
    float: right;
  }

  /* mobile styles at the end for higher precedence */

  /* mobile (any orientation) */
  @media (max-width: 960px) {
    .hideOnMobile {
      display: none;
    }

    /* columns are narrower */
    .column {
      width: 240px;
    }

    /* more button-like appearance on iOS */
    button {
      -webkit-appearance: textfield;
    }
  }

  /* mobile in portrait */
  @media (max-width: 960px) and (orientation: portrait) {
    .hideOnMobilePortrait {
      display: none;
    }

    /* left column fills whole screen */
    #controls_left {
      width: 100%;
      /* unset flexbox full height that will block user input */
      min-height: unset;
      max-height: unset;
    }
  }

  /* mobile in landscape */
  @media (max-width: 960px) and (orientation: landscape) {
    /* keep basemap selector from being too wide */
    #basemap_select {
      width: 115px;
    }
  }

</style>
