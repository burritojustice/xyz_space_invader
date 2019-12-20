<style>

.equals {
  width: 70px;
}

.range {
  width: 30px;
}

</style>

<span>
  <select bind:value=op>
    <option value=""></option>
    <option value="equals">equals</option>
    {#if datatype === 'number'}
      <option value="range">range</option>
    {/if}
  </select>
</span>
<span>
  {#if op != null && op != ''}
      {#if op === 'equals'}
        <input
          class="equals" type="text" placeholder="value(s)"
          on:keydown="event.stopPropagation()"
          bind:value=equals
        >
      {:elseif op === 'range'}
        <input
          class="range" type="text" placeholder="min"
          on:keydown="event.stopPropagation()"
          bind:value=min
        >
        <input
          class="range" type="text" placeholder="max"
          on:keydown="event.stopPropagation()"
          bind:value=max
        >
      {/if}
  {/if}
</span>

<script>

import _ from 'lodash';

// number of milliseconds to delay input update events
const INPUT_DEBOUNCE_TIME = 500;

export default {
  data() {
    return {
      prop: null,
      datatype: null,
      initial: null,
      op: null,
      equals: '',
      min: '',
      max: ''
    }
  },

  onstate({ changed, current, previous }) {
    // first-time initialization with provided values
    if (!previous && current.initial) {
      const data = current.initial;
      this.set({
        op: data.op,
        equals: data.equals != null ? data.equals : '',
        min: data.min != null ? data.min : '',
        max: data.max != null ? data.max : '',
      });
    }
    // send updates to parent component
    else if (changed.op || changed.equals || changed.min || changed.max) {
      let { op, equals, min, max } = current;
      const { datatype } = this.get();

      // add explicit quotes to numeric searches on string fields
      if (datatype === 'string' && equals != null && equals.match(/^\d+$/)) {
        equals = `"${equals}"`;
      }

      this.updateField({ prop: current.prop, values: { op, equals, min, max } });
    }
  },

  methods: {

    // debounced update event to avoid spamming on rapid UI changes
    updateField: _.debounce(function({ prop, values }) {
      console.log({ prop, values });
      this.fire('update', { prop, values });
    }, INPUT_DEBOUNCE_TIME)

  }

};

</script>
