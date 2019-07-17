<pre>
  {histogram}
</pre>

<script>

export default {
  computed: {
    // build histogram text-chart
    histogram: ({ minFilter, maxFilter, valueCounts }) => {
      if (!valueCounts) {
        return;
      }

      const featurePropMin = minFilter;
      const featurePropMax = maxFilter;

      // here we count things for quantiles ()
      const range = featurePropMax - featurePropMin;
      const quantile = 10;
      const step = range / quantile;

      // add up the things in each bucket
      const bucket = [];
      for (let i = 0; i < quantile; i++) {
        bucket[i] = valueCounts.reduce((total, [value, count]) => {
          if ((value > (step * i) + featurePropMin) && (value <= (step * (i+1)) + featurePropMin)) {
            total += count;
          }
          return total;
         }, 1);
      }

      const quantileMax = Math.max(...bucket);
      const quantilePercent = bucket.map(x => x / quantileMax);
      let chart = 'histogram: ' + quantile + ' buckets, ' + step.toFixed(1) + ' wide\n';

      quantilePercent.forEach((x, index) =>  {
        const count = bucket[index].toString();
        const width = 10;
        const columns = Math.ceil(x*width);
        const spacing = ' '.repeat(width - columns);
        let row = count.padStart(6,' ') + 'x | ';

        for (let i = 0; i < columns ; i++) {
          row = row + '*';
          if (i == (columns-1)){
            const suffix = spacing + ' | ' + (index*step + featurePropMin).toFixed(0) + '->' + ((index+1)*step + featurePropMin).toFixed(0);
            row = row + suffix + '\n';
          }
        }
        chart += row;
      });

      return chart;
    }
  }
};

</script>
