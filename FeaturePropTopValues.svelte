{#if showHeader}
  <div style="margin: 5px 0 5px 0;">
    Top values by
    <select bind:value="valueSort">
      <option>count</option>
      <option>values</option>
    </select>
    <div style="color:blue;" id="shuffle_colors" on:click="set({ hashColorSeed: (hashColorSeed *= 10) })">Shuffle colors</div>
  </div>
{/if}

<table>
  <thead>
    <tr><td style="text-align: right;">#</td><td></td><td>Value</td></tr>
  </thead>
  <tbody>
    {#each valueCounts.slice(0, 50) as [value, count], i }
      <tr>
        <td style="width: 15px; text-align: right;">{count}</td>
        <td style="width: 15px;">
          <!-- uses color calc code shared with tangram-->
          {#if valueColorFunction}
            <span class="dot" style="background-color: {valueColorFunction(value)};">
            </span>
          {/if}
        </td>
        <td
          class="value_row"
          class:active="propValue != null && value == propValue"
          on:click="set({propValue: (value != propValue ? value : null)})">
          {maybeStringifyObject(value)}
        </td>
      </tr>
    {/each}
  </tbody>
</table>

{#if valueCounts.length > 50}
  <i>{valueCounts.length - 50} more {valueCounts.length - 50 > 1 ? 'values' : 'value'} for {prop} not shown</i>
{/if}
<script>

export default {
  data() {
    return {
      prop: null,
      propValue: null,
      valueSort: null,
      valueCounts: [],
      valueColorFunction: null,
      showHeader: true
    }
  },

  helpers: {
    maybeStringifyObject(v) {
      // stringify objects, otherwise just return original object
      return (v != null && typeof v === 'object') ? JSON.stringify(v) : v;
    }
  }
};

</script>

<style>

.dot {
  height: 11px;
  width: 11px;
  background-color: yellow;
  border: 2px solid grey;
  border-radius: 50%;
  display: inline-block;
  vertical-align: bottom;
}

.value_row:hover {
  background-color: rgba(240, 240, 240, 0.75);
}

</style>
