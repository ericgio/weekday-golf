function normalizeName(name) {
  name = name.toLowerCase();

  if (name.indexOf('eric g') > -1) {
    return 'Eric Giovanola';
  }

  if (name.indexOf('eric z') > -1) {
    return 'Eric Zamore';
  }

  if (name.indexOf('paul') > -1) {
    return 'Paul McDonald';
  }

  if (name.indexOf('raylene') > -1) {
    return 'Raylene Yung';
  }

  if (name.indexOf('makinde') > -1) {
    return 'Makinde Adeagbo';
  }

  if (name.indexOf('ola') > -1) {
    return 'Ola Okelola';
  }

  throw Error(`Who let ${name} play?`);
}

/**
 * Null-safe way of indexing into an object's properties.
 * Returns the value or a specified default value.
 */
function idx(obj, key, defaultValue) {
  return (obj && obj[key]) || defaultValue;
}

/**
 * Round a number to the specified level of precision.
 */
function roundTo(value, precision = 0) {
  const multiplier = 10 ** precision;
  return Math.round(value * multiplier) / multiplier;
}

function getAvg(numerator, denominator, precision = 1) {
  return roundTo(numerator / denominator, precision);
}

function getRoundsPlayedPercentage(roundsPlayed, totalRounds) {
  return `${roundTo((roundsPlayed * 100) / totalRounds, 1)}%`;
}

module.exports = {
  getAvg,
  getRoundsPlayedPercentage,
  idx,
  normalizeName,
  roundTo,
};
