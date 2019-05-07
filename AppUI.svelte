<svelte:window on:keydown="handleKeyPress(event)" />

<div id="controls_left" class="controls">
  <div id="spaces">
    <p id="space_info">
      {#if spaceInfo}
        {spaceId}: {spaceInfo.title}<br>
        {spaceInfo.numFeatures.toLocaleString()} features, {spaceInfo.dataSize}<br>
        {spaceInfo.description}
      {:elseif !spaceLoading}
        <input type="text" placeholder="enter an XYZ space ID" bind:value='spaceId'>
        <input type="text" placeholder="enter an XYZ token" bind:value='token'>
        <button on:click="updateSpace(true)">Show XYZ Space</button>
      {/if}
    </p>
    <p id="style_info">
      {#if displayToggles}
        <table>
          <tr>
            <td on:click='toggleDisplayOption("roads")'>roads:</td>
            <td>{displayToggles.roads}</td>
            <td on:click='toggleDisplayOption("buildings")'>buildings:</td>
            <td>{displayToggles.buildings}</td>
            <td on:click='toggleDisplayOption("water")'>water:</td>
            <td>{displayToggles.water}</td>
          </tr>
          <tr>
            <td on:click='toggleDisplayOption("points")'>points:</td>
            <td>{displayToggles.points}</td>
            <td on:click='toggleDisplayOption("lines")'>lines:</td>
            <td>{displayToggles.lines}</td>
            <td on:click='toggleDisplayOption("outlines")'>outlines:</td>
            <td>{displayToggles.outlines}</td>
          </tr>
          <tr>
            <td on:click='toggleBasemap()'>basemap:</td>
            <td>{basemap}</td>
            <td on:click='toggleDisplayOption("randomColors")'>colors:</td>
            <td>{displayToggles.randomColors}</td>
          </tr>
        </table>
      {/if}
    </p>
  </div>
  <div id="properties">
    {#if selectedFeature}
      <table>
        {#each featurePropRows as r}
          <tr
            class:active="r.prop === selectedFeatureProp"
            on:click="set({ selectedFeatureProp: r.prop })"
          >
          <td>{@html formatFeatureRow(r)}</td>
          </tr>
        {/each}
      </table>
    {:else}
      Interact with map to see properties.<br>Click on a property value to generate unique colors.
    {/if}
  </div>

  <div id="colors">
    <p id="colorProperties">
      {#if selectedFeatureProp && selectedFeaturePropCount != null}
        {selectedFeaturePropCount} unique values of <i>{selectedFeatureProp}</i> in viewport
        <p style="color:blue;" id="clear_color_properties" on:click="set({ selectedFeatureProp: null })">CLEAR COLOR FILTERS</p>
      {:else}
        click on property value for unique colors
      {/if}
    </p>
    <table id="prop_stats">
      {#if selectedFeatureProp && selectedFeaturePropValueCounts}
        {#each selectedFeaturePropValueCounts as r}
          <tr>
            <td style="width: 15px;text-align: right;">{r[1]}</td>
            <td style="width: 15px;">
              <!-- same color hash as tangram-->
              <span class="dot" style="background-color: {colorHash(r[0])};"> </span>
            </td>
            <td>{maybeStringifyObject(r[0])}</td>
          </tr>
        {/each}
      {/if}
    </table>
  </div>
</div>

<div id="controls_right" class="controls">
  <div id="tag_summary">
    <table id="tag_stats">
      {#if numFeaturesInViewport}
        <tr><td>features in viewport</td><td>{numFeaturesInViewport}</td></tr>
      {/if}
      {#if tagsInViewport}
        <tr><td>tags in viewport</td><td>{tagsInViewport.length}</td></tr>
      {/if}
      <tr><td>unique tags in viewport</td><td>{uniqueTagsInViewport.size}</td></tr>
      <tr><td>unique tags seen</td><td>{uniqueTagsSeen.size}</td></tr>
    </table>
    <p id="tags_filtered">
      filtering by tags:<br>
      {#if tagFilterList.length > 0}
        {tagFilterList.join(', ')}
      {:else}
        <i>no tags filtered<br><br></i>
      {/if}
    </p>
    <p style="color:blue;" id="clear_filters" on:click="set({ tagFilterList: [] })">CLEAR TAG FILTERS</p>
    <p id="and_or">
      <input type="radio" g="and_or" value="or" bind:group='tagFilterAndOr'>or
      <input type="radio" name="and_or" value="and" bind:group='tagFilterAndOr'>and<br>
    <p>
  </div>
  <div id="tag_list">
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
    <br>
    <span style="color:blue;" on:click="toggleTagSort()">
      [sort by {nextTagSort}]
    </span>
    <p id="tags">
      <!-- The JSON.stringify gives Svelte a way to uniquely identify the full tag info.
        This ensures that the correct checkboxes stay checked when the list is re-ordered
        (for instance when tag counts change). See https://svelte.technology/guide#keyed-each-blocks.
      -->
      {#each tagDisplayList as tag (JSON.stringify(tag))}
        <label>
          <input type="checkbox" value="{tag[0]}" bind:group='tagFilterList'>
          ({tag[1]}x) {tag[0]}
        </label>
        <br>
      {/each}
    </p>
  </div>
</div>

<script>

// import displayOptions from './displayOptions';

export default {
  data() {
    return {
      // set these to empty strings (not null) to get placeholder text in input
      spaceId: '',
      token: '',
      spaceInfo: null,

      selectedFeature: null,
      selectedFeatureProp: null,
      selectedFeaturePropCount: null,
      selectedFeaturePropValueCounts: null,

      tagsWithCounts: [],
      tagFilterList: [],
      tagFilterAndOr: 'or',
      tagFilterViewport: false,
      tagFilterAt: false,
      tagSort: 'frequency',

      numFeaturesInViewport: null,
      tagsInViewport: [],
      uniqueTagsSeen: new Set(),

      displayToggles: null,
    }
  },

  computed: {
    basemapScene: ({ basemap }) => getBasemapScene(basemap),

    featurePropRows: ({ selectedFeature }) => selectedFeature && buildFeatureRows(selectedFeature.properties),

    uniqueTagsInViewport: ({ tagsInViewport }) => new Set([...tagsInViewport]),

    nextTagSort: ({ tagSort }) => (tagSort === 'frequency' ? 'name' : 'frequency'),

    // build the list of tags for display with checkboxes
    tagDisplayList: ({ tagsWithCounts, tagSort, tagFilterList, tagFilterViewport, tagFilterAt, uniqueTagsSeen }) => {
      // start with tags currently in the viewport
      let tags = [...tagsWithCounts]; // copy tags so we don't modify original list

      // add any tags that are selected, but not currently in the viewport
      // this also handles cases where an impossible tag combo is selected (postcode 98125 AND postcode 98122),
      // but we want those tags to still show up in the list so they can be de-selected
      tagFilterList.forEach(tag => {
        if (!tags.find(t => t[0] === tag)) {
          tags.push([tag, 0]);
        }
      });

      // add all uniquely seen tags that aren't currently in the viewport
      if (!tagFilterViewport) {
        uniqueTagsSeen.forEach(tag => {
          if (!tags.find(t => t[0] === tag)) {
            tags.push([tag, 0]);
          }
        });
      }

      // remove tags without an @ if desired
      if (tagFilterAt) {
        tags = tags.filter(tag => tag[0].includes('@'));
      }

      // sort tags as desired
      if (tagSort === 'name') {
        tags.sort((a, b) => a[0] > b[0] ? 1 : -1);
      }
      else if (tagSort === 'frequency') {
        tags.sort((a, b) => a[1] < b[1] ? 1 : -1);
      }

      return tags;
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

    queryParams: ({ spaceId, token, basemap, displayToggles, selectedFeatureProp, tagFilterQueryParam }) => {
      const params = new URLSearchParams();

      if (spaceId) {
        params.set('space', spaceId);
      }

      if (token) {
        params.set('token', token);
      }

      params.set('basemap', basemap);

      for(const p in displayToggles) {
        params.set(p, displayToggles[p]);
      }

      if (tagFilterQueryParam) {
        params.set('tags', tagFilterQueryParam);
      }

      if (selectedFeatureProp) {
        params.set('property', selectedFeatureProp);
      }

      return params;
    }

  },

  onstate({ changed, current, previous }) {
    if (changed.tagsInViewport) {
      this.set({
        uniqueTagsSeen: new Set([...current.uniqueTagsSeen, ...current.tagsInViewport])
      });
    }

    // Apply Tangram scene updates based on state change
    if (changed.basemapScene) {
      this.fire('loadScene', {
        basemapScene: current.basemapScene
      });
    }

    if (changed.selectedFeatureProp || changed.displayToggles || changed.tagFilterQueryParam) {
      this.fire('updateScene', {
        displayToggles: current.displayToggles,
        selectedFeatureProp: current.selectedFeatureProp,
        tagFilterQueryParam: current.tagFilterQueryParam
      });
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
      this.fire('updateQueryString', {
        queryParams: current.queryParams
      });
    }

  },

  methods: {
    setFromQueryParams(params) {
      // convert query params to object
      params = [...params.entries()].reduce((p, [k, v]) => { p[k] = v; return p; }, {});

      // set these to empty strings (not null) to get placeholder text in input
      const spaceId = params.space || '';
      const token = params.token || '';

      // parse out display option toggles
      const toggles = {};
      for (const p in params) {
        if (displayOptions[p]) {
          if (displayOptions[p].parse) {
            // parse display options values (e.g. convert strings to numbers, etc.)
            toggles[p] = displayOptions[p].parse(params[p]);
          }
          else {
            toggles[p] = params[p];
          }
        }
      }

      // set default values for display options
      for (const p in displayOptions) {
        if (toggles[p] == null) {
          toggles[p] = defaultDisplayOptionValue(p);
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

      this.set({
        spaceId,
        token,
        basemap,
        displayToggles: toggles,
        selectedFeatureProp: params.property,
        tagFilterList,
        tagFilterAndOr
      });

      this.updateSpace(false);
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

    toggleBasemap() {
      this.set({ basemap: getNextBasemap(this.get().basemap) });
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
      // c = toggle colors (color hash of all properties, pretty good but some chance of bordering features getting a similar color)
      // h = toggle lines and dot highlights
      // l = colors good for a light basemap
      // o = toggle polygon outlines
      // p = make dots bigger
      // r = toggle roads
      // s = make dots smaller and lines narrower
      // w = put polygons under water

      if (key == "m") { // toggle basemap
        this.toggleBasemap();
      }
      else {
        if (key == "b") { // toggle buildings
          this.toggleDisplayOption('buildings');
        }
        else if (key == "c") { // color hash each feature
          this.toggleDisplayOption('randomColors');
        }
        else if (key == "h") { // highlight colors and make points bigger
          this.toggleDisplayOption('highlight');
        }
        else if (key == "o") { // toggle polygon outlines
          this.toggleDisplayOption('outlines');
        }
        else if (key == "p") { // make points bigger
          this.toggleDisplayOption('points');
        }
        else if (key == "r") { // toggle roads
          this.toggleDisplayOption('roads');
        }
        else if (key == "l") { // make lines smaller
          this.toggleDisplayOption('lines');
        }
        else if (key == "w") { // put polygons under water
          this.toggleDisplayOption('water');
        }
      }
    }
  },

  helpers: {
    formatFeatureRow(r) {
      const indent = 4;
      let t = Array(r.level * indent).fill('&nbsp;').join('');
      if (r.prop !== undefined) t += r.prop + ': ';
      if (r.value !== undefined) t += r.value;
      return t;
    },

    colorHash(value) {
      if (typeof value !== 'string') {
        value = (value === undefined ? 'undefined' : JSON.stringify(value));
      }

      if (['null', 'undefined'].indexOf(value) > -1) {
        return 'gray'; // handle null/undefined values
      }

      let hash = 0, i, chr;
      if (value === 0) { hash = 0 };
      for (i = 0; i < value.length; i++) {
        chr = value.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
      }
      var color = 'hsla(' + hash + ', 100%, 50%, 0.75)';
      return color;
    },

    maybeStringifyObject(v) {
      // stringify objects, otherwise just return original object
      return (v != null && typeof v === 'object') ? JSON.stringify(v) : v;
    }
  }
}

function defaultDisplayOptionValue(p) {
  return displayOptions[p] && displayOptions[p].values[0];
}

function buildFeatureRows(obj, level = -1, prop = null, rows = []) {
  if (Array.isArray(obj)) {
    if (prop) {
      rows.push({ level, obj, prop }); // header row
    }
    obj.forEach((x, i) => buildFeatureRows(x, level + 1, prop, rows));
  } else if (typeof obj === 'object' && obj != null) {
    if (prop) {
      rows.push({ level, obj, prop }); // header row
    }
    for (var prop in obj) {
      buildFeatureRows(obj[prop], level + 1, prop, rows);
    }
  } else {
    rows.push({ level, obj, prop, value: obj });
  }
  return rows;
}



</script>

<style>

  .controls {
    position: absolute;
    z-index: 1000;
    min-height: 100vh;
    max-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .controls div {
    margin: 5px;
    padding: 0.5em;
    background-color: rgba(200, 200, 200, 0.75);
    border: 1px solid black;
    border-radius: 3px;
    color: black;
    box-shadow: 2px 2px 2px black;
  }

  #controls_left {
    width: 300px;
  }

  #space_info {
    /* for long space descriptions */
    /* overflow-x: auto; */
    overflow-wrap: break-word;
  }

  #properties {
    overflow: auto;
    flex: 1 1 0;
  }

  #properties table {
    width: 100%;
  }

  #properties tr:hover {
    background-color: rgba(240, 240, 240, 0.75);
  }

  #properties tr.active {
    background-color: rgba(175, 175, 175, 0.75);
  }

  #colors {
    overflow: auto;
    flex: 1 1 auto;
    height: 20vh;
  }

  #controls_right {
    width: 350px;
    right: 0;
  }

  #tag_list {
    overflow: auto;
    flex: 1 1 auto;
  }

  .dot {
    height: 11px;
    width: 11px;
    background-color: yellow;
    border: 2px solid grey;
    border-radius: 50%;
    display: inline-block;
    vertical-align: bottom;
  }

</style>
