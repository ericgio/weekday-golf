const parse = require('csv-parse/lib/sync');
const fs = require('fs');
const moment = require('moment');
const path = require('path');

const CSV_PATH = path.join(__dirname, 'csv');
const PAR = 27;

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

function idx(obj, key, defaultValue) {
  return (obj && obj[key]) || defaultValue;
}

function round(value, precision = 0) {
  /* eslint-disable-next-line no-restricted-properties */
  const multiplier = Math.pow(10, precision);
  return Math.round(value * multiplier) / multiplier;
}

function getAvgScore(cumScore, totalRounds) {
  return round(cumScore / totalRounds, 1);
}

function getRoundsPlayedPercentage(roundsPlayed, totalRounds) {
  return `${round((roundsPlayed * 100) / totalRounds, 1)}%`;
}

const rounds = [];

// Read and parse .csv files.
fs
  .readdirSync(CSV_PATH)
  .forEach((filepath, idx) => {
    const contents = fs.readFileSync(path.join(CSV_PATH, filepath));

    const [filename] = filepath.split('.');
    const m = moment(filename, 'YY_MM_DD');
    const round = {
      date: m.format(),
      // TODO: Account for other locations.
      location: 'Mariner\'s Point',
      players: [],
    };

    const sheet = parse(contents);

    // Skip the table headers.
    sheet.forEach((row, idx) => {
      if (idx < 2) {
        return;
      }

      const name = row.shift();
      const scores = row
        .slice(0, 9)
        .map((score, idx) => ({
          hole: idx + 1,
          score: parseInt(score, 10),
        }));

      round.players.push({
        name: normalizeName(name),
        scores,
        total: scores.reduce((acc, { score }) => acc + score, 0),
      });
    });

    rounds.push(round);
  });

// Write rounds and stats data to file.
fs.writeFileSync(
  path.join(__dirname, 'rounds.json'),
  JSON.stringify(rounds, null, 2)
);

const totalRounds = rounds.length;

// Calculate stats from rounds data.
const statsByPlayer = Object.values(rounds.reduce((acc, { players }) => {
  players.forEach(({ name, scores, total }) => {
    const player = acc[name];

    const cumScore = idx(player, 'cumScore', 0) + total;
    const roundsPlayed = idx(player, 'roundsPlayed', 0) + 1;
    const avgScore = getAvgScore(cumScore, roundsPlayed);

    const scoreDist = idx(player, 'scoreDist', {});
    const scoresByHole = idx(player, 'scoresByHole', {});

    scores.forEach(({ hole, score }) => {
      scoreDist[score] = idx(scoreDist, score, 0) + 1;

      const cumHoleScore = idx(scoresByHole[hole], 'cumHoleScore', 0) + score;
      scoresByHole[hole] = {
        hole,
        cumHoleScore,
        avgHoleScore: round(cumHoleScore / roundsPlayed, 1),
      };
    });

    acc[name] = {
      name,
      cumScore,
      avgScore,
      avgScoreToPar: round(avgScore - PAR, 1),
      roundsPlayed,
      roundsPlayedPercent: getRoundsPlayedPercentage(
        roundsPlayed,
        totalRounds
      ),
      scoreDist,
      scoresByHole,
    };
  });

  return acc;
}, {}));

const globalScoresByHole = statsByPlayer.reduce((acc, player) => {
  Object.values(player.scoresByHole).forEach(({
    avgHoleScore,
    cumHoleScore,
    hole,
  }) => {
    const bestScore = idx(acc[hole], 'bestScore', 100);
    const cumScore = idx(acc[hole], 'cumHoleScore', 0) + cumHoleScore;
    const cumRounds = idx(acc[hole], 'cumRounds', 0) + player.roundsPlayed;

    acc[hole] = {
      hole,
      bestScore: avgHoleScore < bestScore ? avgHoleScore : bestScore,
      avgHoleScore: round(cumScore / cumRounds, 1),
      cumHoleScore: cumScore,
      cumRounds,
    };
  });

  return acc;
}, {});

const roundsByScore = rounds
  .reduce((acc, { date, location, players }) => {
    players.forEach(({ name, total }) => {
      acc.push({
        date,
        location,
        name,
        total,
        toPar: round(total - PAR),
      });
    });

    return acc;
  }, [])
  .sort((r1, r2) => (r1.total > r2.total ? 1 : -1));

const stats = {
  globalScoresByHole,
  roundsByScore,
  statsByPlayer,
};

fs.writeFileSync(
  path.join(__dirname, 'stats.json'),
  JSON.stringify(stats, null, 2)
);
