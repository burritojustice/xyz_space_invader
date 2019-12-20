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
    <option value="range">range</option>
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

export default {
  data() {
    return {
      prop: null,
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
      const data = current.initial[current.prop];
      if (data) {
        this.set({
          op: data.op,
          equals: data.equals != null ? data.equals : '',
          min: data.min != null ? data.min : '',
          max: data.max != null ? data.max : '',
        });
      }
    }
    // send updates to parent component
    else if (changed.op || changed.equals || changed.min || changed.max) {
      const { op, equals, min, max } = current;
      this.fire('update', { prop: current.prop, values: { op, equals, min, max } });
    }
  }

};

</script>
