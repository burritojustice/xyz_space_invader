<div>
  <div>histogram: {numQuantiles} buckets, {step.toFixed(1)} wide</div>
  <table style="width: 100%">
    {#each quantiles as { from, to, fromColor, toColor, count, percent }}
      <tr>
        <td>{count}x</td>
          <td style="width: 65%">
            <div style="width: {percent}%; height: 15px;
                background: {
                  (fromColor && toColor) ? `linear-gradient(90deg, ${fromColor}, ${toColor})` : 'lightblue'
                }
              ">&nbsp;</div>
          </td>
          <td style="width: 35%">{from} ⇢ {to}</td>
        </tr>
    {/each}
  </table>
</div>

<script>

import { parseNumber } from './colorFunctions';

export default {
  data() {
    return {
      numQuantiles: 10,
      minFilter: null,
      maxFilter: null,
      parseNumber // passthrough for template
    }
  },

  computed: {
    range: ({ minFilter, maxFilter }) => maxFilter - minFilter,
    step: ({ numQuantiles, range }) => range / numQuantiles,

    quantiles: ({ numQuantiles, minFilter, range, step, valueCounts, valueColors }) => {
      if (!valueCounts || !range) {
        return [];
      }

      // add up the things in each bucket
      const bucket = [];
      for (let i = 0; i < numQuantiles; i++) {
        bucket[i] = valueCounts.reduce((total, [value, count]) => {
          if ((value > (step * i) + minFilter) && (value <= (step * (i+1)) + minFilter)) {
            total += count;
          }
          return total;
         }, 1);
      }

      const quantileMax = Math.max(...bucket);
      const quantilePercent = bucket.map(x => x / quantileMax);

      return quantilePercent.map((x, index) =>  {
        const count = bucket[index].toString();
        const columns = Math.ceil(x*numQuantiles);

        const from = (index*step + minFilter).toFixed(0);
        const to = ((index+1)*step + minFilter).toFixed(0);
        const percent = columns / numQuantiles * 100;

        const fromColor = valueColors ? valueColors[valueCounts.findIndex(([v]) => from >= parseNumber(v))] : null;
        const toColor = valueColors ? valueColors[valueCounts.findIndex(([v]) => to >= parseNumber(v))] : null;

        return {
          from,
          to,
          fromColor,
          toColor,
          count,
          percent
        };
      });
    }
  }
};

</script>
