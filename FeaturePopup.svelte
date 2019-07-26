<div style="{featurePinned ? 'height: 200px; overflow: auto;' : ''}">
  <table>

  {#each summaryProps as [prop, value, propStack]}
    <tr>
      <td style="width: 50px;"><b>{@html Array((propStack.length - 1) * 2).fill('&nbsp;').join('')}{propStack[propStack.length-1]}</b></td>
      <td style="word-break: break-all;">{typeof value !== 'object' ? value : ''}</td>
    </tr>
  {/each}

  {#if extendedProps.length && summaryProps.length}
    <tr><td colspan="2"><hr></td></tr>
  {/if}

  {#each extendedProps as [prop, value, propStack]}
    <tr>
      <td style="width: 50px;"><b>{@html Array((propStack.length - 1) * 2).fill('&nbsp;').join('')}{propStack[propStack.length-1]}</b></td>
      <td style="word-break: break-all;">{typeof value !== 'object' ? value : ''}</td>
    </tr>
  {/each}

  {#if !featurePinned && feature}
    <tr><td colspan="2"><i>Click to see all {Object.keys(feature.properties).length} properties</i></td></tr>
  {/if}
</div>

<script>

import { parseNestedObject } from './utils';

export default {
  data() {
    return {
      featurePinned: false
    }
  },

  computed: {
    summaryProps: ({ feature, featureProp, featurePropStack }) => {
      if (feature == null) {
        return [];
      }

      return [
          ['id', feature.properties.id, ['id']],
          ['name', feature.properties.name, ['name']],
          [featureProp, lookupProperty(feature.properties, featurePropStack) || 'null', featurePropStack]
        ]
        .filter(x => x[0] && x[1]); // only include props that had values
    },

    extendedProps: ({ feature, featureProp, featurePinned }) => {
      if (!featurePinned || feature == null) {
        return [];
      }

      return parseNestedObject(feature.properties)
        .map(r => [r.prop, r.obj, r.propStack])
        .filter(([p]) => ['id', 'name', featureProp].indexOf(p) === -1)
        .filter(x => x[0] && x[1]) // only include props that had values
        // alpha sort, @ properties at bottom
        .sort(([a], [b]) => a[0] === '@' ? 1 : b[0] === '@' ? -1 : a[0] > b[0] ? 1 : a[0] < b[0] ? -1 : 0);
    }
  }

};

// lookup value of a nested feature property
function lookupProperty(properties, propStack) {
  return propStack && propStack.reduce((obj, prop) => obj && obj[prop] !== undefined ? obj[prop] : null, properties);
}

</script>
