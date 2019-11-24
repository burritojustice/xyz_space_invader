import { parseNumber, lookupProperty } from './utils';

export function calcFeaturePropertyStats(features, propStack) {
  if (!propStack || propStack.length === 0) {
    return {};
  }

  // get the desired property value for each feature
  const propValues = features.map(f => lookupProperty(f.properties, propStack));

  // convert to numbers to get min/max
  const numberValues = propValues
    .map(parseNumber)
    .filter(x => typeof x === 'number' && !isNaN(x) && Math.abs(x) !== Infinity);

  let min, max, mean, median, stdDev, sigmaPercent, sigmaFloor, sigmaCeiling;

  if (numberValues.length > 0 ) {
    min = Math.min(...numberValues);
    max = Math.max(...numberValues);

    mean = numberValues.reduce((a,b) => a + b, 0) / numberValues.length;
    if (numberValues.length % 2 === 0) {
      median = (numberValues[(numberValues.length / 2)] + numberValues[(numberValues.length / 2) + 1]) / 2;
    }
    else {
      median = numberValues[((numberValues.length + 1) / 2)]
    }

    const squareDiffs = numberValues.map(value => {
      const diff = value - mean;
      const sqrDiff = diff * diff;
      return sqrDiff;
    });

    const avgSquareDiff = squareDiffs.reduce((a,b) => a + b, 0) / squareDiffs.length;
    stdDev = Math.sqrt(avgSquareDiff);

    // calculating sigmas and ranges using standard deviations
    sigmaFloor = mean - stdDev;
    sigmaCeiling = mean + stdDev;

    const sigmaCount = numberValues.reduce((total,amount) => {
      if ((amount > sigmaFloor) && (amount < sigmaCeiling)) {
        total += 1;
      }
      return total;
    }, 0);
    sigmaPercent = 100 - sigmaCount / numberValues.length
    // const sigmaOutside = numberValues.length - sigma.count
  }

  // count up the number of each unique property value
  const valueCounts = new Map(); // use map to preserve key types (e.g. avoid '[Object object]' string keys)
  for (let i = 0; i < propValues.length; i++) {
    const value = propValues[i];
    if (valueCounts.get(value) == null) {
      valueCounts.set(value, 0);
    }
    valueCounts.set(value, valueCounts.get(value) + 1);
  }

  // sort the list of properties by count
  const sortedValueCounts = Array.from(valueCounts.entries()).sort((a, b) => {
    const d = b[1] - a[1];
    if (d !== 0) {
      return d;
    }

    if (a < b) {
      return -1;
    }
    else if (b < a) {
      return 1;
    }
    else {
      return 0;
    }
  });

  return {
    uniqueCount: valueCounts.size,
    sortedValueCounts,
    min, max, median, mean, stdDev,
    sigmaPercent, sigmaFloor, sigmaCeiling
  };
}
