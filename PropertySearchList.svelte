{#if numProperties > 0}
  <div>
    {numProperties} properties
    ({numSearchableProperties === numProperties ? 'all' : numSearchableProperties} searchable): 
    <input type="checkbox" id="PropSearchoverride" name="PropSearchoverride">
    <label for="PropSearchoverride">Override</label>
  </div>
  <table>
    {#each Object.entries(properties) as [prop, { searchable, datatype }]}
      <tr>
        <td style="width: 105px; max-width: 105px; overflow: hidden;">
          {prop}
        </td>
        {#if searchable || PropSearchoverride}
          <td>
            <PropertySearchField
              prop={prop}
              datatype={datatype}
              initial={propertySearch[prop]}
              on:update="updatePropertySearchField(event)"
            />
          </td>
        {:else}
          <td></td>
        {/if}
      </tr>

    {/each}
  </table>
{/if}

<script>

export default {
  data() {

    return {
      properties: null,
      propertySearch: null
    }
  },

  components: {
    PropertySearchField: './PropertySearchField.svelte'
  },

  computed: {
    numProperties: ({ properties }) => {
      return properties ? Object.values(properties).length : 0;
    },

    numSearchableProperties: ({ properties }) => {
      return properties ? Object.values(properties).filter(p => p.searchable).length : 0;
    },
    
    PropSearchoverride: () => {
      var checkBox = document.getElementById("PropSearchoverride");
      var override = false;
      if (checkBox.checked == true){ override = true }
      return override;
    }
  },

  methods: {
    updatePropertySearchField({ prop, values }) {
      if (!prop) {
        return;
      }

      const { propertySearch } = this.get();

      if (values.op) {
        propertySearch[prop] = { ...values };
      else {
        delete propertySearch[prop];
      }

      this.set({ propertySearch });
    },
  }

};

</script>

