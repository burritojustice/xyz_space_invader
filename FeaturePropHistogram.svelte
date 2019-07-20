<div>
  <div>histogram: {numQuantiles} buckets, {step.toFixed(1)} wide</div>
  <table style="width: 100%">
    {#if outsideRange[0]}
      <tr>
        <td>{outsideRange[0]}x</td>
        <td></td>
        <td style="width: 35%">&lt; {formatNumber(minFilter, step)}</td>
      </tr>
    {/if}

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
        <td style="width: 35%">{formatNumber(from, step)} ⇢ {formatNumber(to, step)}</td>
      </tr>
    {/each}

    {#if outsideRange[1]}
      <tr>
        <td>{outsideRange[1]}x</td>
        <td></td>
        <td style="width: 35%">&gt; {formatNumber(maxFilter+1, step)}</td>
      </tr>
    {/if}
  </table>
</div>

<script>

import { parseNumber } from './colorFunctions';

export default {
  data() {
    return {
      numQuantiles: 10,
      minFilter: null,
      maxFilter: null
    }
  },

  computed: {
    range: ({ minFilter, maxFilter }) => maxFilter+1 - minFilter,
    step: ({ numQuantiles, range }) => range / numQuantiles,

    // track values above and below the filter range
    outsideRange: ({ minFilter, maxFilter, valueCounts }) => {
      let below = 0, above = 0;
      valueCounts.forEach(([value, count]) => {
        if (value < minFilter) {
          below += count;
        }
        else if (value > maxFilter) {
          above += count;
        }
      });
      return [below, above];
    },

    // calculate buckets for data by range and number of quantiles
    quantiles: ({ numQuantiles, minFilter, range, step, valueCounts, valueColors }) => {
      if (!valueCounts || !range) {
        return [];
      }

      // add up the things in each bucket
      const bucket = [];
      for (let i = 0; i < numQuantiles; i++) {
        bucket[i] = valueCounts.reduce((total, [value, count]) => {
          if ((value >= (step * i) + minFilter) && (value < (step * (i+1)) + minFilter)) {
            total += count;
          }
          return total;
         }, 0);
      }

      const quantileMax = Math.max(...bucket);
      const quantilePercent = bucket.map(x => x / quantileMax);

      return quantilePercent.map((x, index) =>  {
        const count = bucket[index];
        const columns = Math.ceil(x*numQuantiles);

        const from = (index*step + minFilter);//.toFixed(0);
        const to = ((index+1)*step + minFilter);//.toFixed(0);
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
  },

  helpers: {
    formatNumber(value, step) {
      if (Math.floor(value) === value) {
        return value.toFixed(0); // show integers as integers
      }

      // adapt the number of digits displayed to the data resolution
      const digits = Math.max(0, Math.ceil(Math.log10(1/step)))
      return value.toFixed(digits);
    }
  }
};

</script>
