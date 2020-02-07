require('dotenv').config();

const fs = require('fs');
const { google } = require('googleapis');
const moment = require('moment-timezone');
const path = require('path');

const {
  getAvg,
  getRoundsPlayedPercentage,
  idx,
  normalizeName,
  roundTo,
} = require('./utils');

const { GOOGLE_SHEETS_API_KEY, SPREADSHEET_ID } = process.env;
const CELL_RANGE = 'A3:J';
const PAR = 27;

// Initialize Sheets API.
const sheets = google.sheets({
  version: 'v4',
  auth: GOOGLE_SHEETS_API_KEY,
});

const options = {
  spreadsheetId: SPREADSHEET_ID,
};

async function parseSheet(sheet) {
  const { title } = sheet.properties;

  const { data } = await sheets.spreadsheets.values.get({
    ...options,
    range: `${title}!${CELL_RANGE}`,
  });

  const players = data.values.map((row) => {
    const name = row.shift();
    const scores = row.map((score, idx) => ({
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
    date: moment(title).format(),
    players,
    // TODO: Account for other locations.
    location: 'Mariner\'s Point',
    timezone: 'America/Los_Angeles',
  };
}

function getStatsByPlayer(acc, { players }, index, rounds) {
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
}

function getGlobalScoresByHole(acc, { roundsPlayed, scoresByHole }) {
  Object.values(scoresByHole).forEach(({
    avgHoleScore,
    cumHoleScore,
    hole,
  }) => {
    const bestScore = idx(acc[hole], 'bestScore', 100);
    const cumScore = idx(acc[hole], 'cumHoleScore', 0) + cumHoleScore;
    const cumRounds = idx(acc[hole], 'cumRounds', 0) + roundsPlayed;

    acc[hole] = {
      hole,
      bestScore: avgHoleScore < bestScore ? avgHoleScore : bestScore,
      avgHoleScore: getAvg(cumScore, cumRounds),
      cumHoleScore: cumScore,
      cumRounds,
    };
  });

  return acc;
}

function getRoundsByScore(acc, { date, location, players }) {
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
}

function getStats(rounds) {
  const statsByPlayer = Object.values(rounds.reduce(getStatsByPlayer, {}));

  return {
    globalScoresByHole: statsByPlayer.reduce(getGlobalScoresByHole, {}),
    roundsByScore: rounds
      .reduce(getRoundsByScore, [])
      .sort((r1, r2) => {
        if (r1.total > r2.total) return 1;
        if (r1.total < r2.total) return -1;
        return 0;
      }),
    statsByPlayer,
  };
}

// Fetch spreadsheet data using Sheets API.
sheets.spreadsheets.get(options)
  .then(({ data }) => Promise.all(data.sheets.map(parseSheet)))
  .then((rounds) => {
    const stats = getStats(rounds);

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
  });
