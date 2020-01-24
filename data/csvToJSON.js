const parse = require('csv-parse/lib/sync');
const fs = require('fs');
const moment = require('moment');
const path = require('path');

const {
  getAvg,
  getRoundsPlayedPercentage,
  idx,
  normalizeName,
  roundTo,
} = require('./utils');

const CSV_PATH = path.join(__dirname, 'csv');
const PAR = 27;

// Read and parse .csv files.
const rounds = fs
  .readdirSync(CSV_PATH)
  .map((filepath, idx) => {
    const [filename] = filepath.split('.');
    const contents = fs.readFileSync(path.join(CSV_PATH, filepath));

    // Note: Skip the first two rows.
    /* eslint-disable-next-line no-unused-vars */
    const [_, __, ...rows] = parse(contents);

    const players = rows.map((row, idx) => {
      const name = row.shift();
      const scores = row
        .slice(0, 9)
        .map((score, idx) => ({
          hole: idx + 1,
          score: parseInt(score, 10),
        }));

      return {
        name: normalizeName(name),
        scores,
        total: scores.reduce((acc, { score }) => acc + score, 0),
      };
    });

    return {
      date: moment(filename, 'YY_MM_DD').format(),
      // TODO: Account for other locations.
      location: 'Mariner\'s Point',
      players,
    };
  });

// Calculate stats from rounds data.
const statsByPlayer = Object.values(rounds.reduce((acc, { players }) => {
  players.forEach(({ name, scores, total }) => {
    const player = acc[name];

    const cumScore = idx(player, 'cumScore', 0) + total;
    const roundsPlayed = idx(player, 'roundsPlayed', 0) + 1;
    const avgScore = getAvg(cumScore, roundsPlayed);

    const scoreDist = idx(player, 'scoreDist', {});
    const scoresByHole = idx(player, 'scoresByHole', {});

    scores.forEach(({ hole, score }) => {
      scoreDist[score] = idx(scoreDist, score, 0) + 1;

      const cumHoleScore = idx(scoresByHole[hole], 'cumHoleScore', 0) + score;
      scoresByHole[hole] = {
        hole,
        cumHoleScore,
        avgHoleScore: getAvg(cumHoleScore, roundsPlayed),
      };
    });

    acc[name] = {
      name,
      cumScore,
      avgScore,
      avgScoreToPar: roundTo(avgScore - PAR, 1),
      roundsPlayed,
      roundsPlayedPercent: getRoundsPlayedPercentage(
        roundsPlayed, // Rounds played by player
        rounds.length // Total rounds played
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
      avgHoleScore: getAvg(cumScore, cumRounds),
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
        toPar: roundTo(total - PAR),
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

// Write rounds and stats data to file.
[
  { data: rounds, name: 'rounds' },
  { data: stats, name: 'stats' },
].forEach(({ data, name }) => {
  fs.writeFileSync(
    path.join(__dirname, `${name}.json`),
    JSON.stringify(data, null, 2)
  );
});
