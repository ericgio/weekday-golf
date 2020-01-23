const parse = require('csv-parse/lib/sync');
const fs = require('fs');
const moment = require('moment');
const path = require('path');

const CSV_PATH = path.join(__dirname, 'csv');

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

const rounds = [];

// Read and parse .csv files.
fs
  .readdirSync(CSV_PATH)
  .forEach((filepath, idx) => {
    const contents = fs.readFileSync(path.join(CSV_PATH, filepath));

    const [filename, ext] = filepath.split('.');
    const m = moment(filename, 'YY_MM_DD');
    const round = {
      date: m.format(),
      location: 'Mariner\'s Point',
      players: [],
    };

    const sheet = parse(contents);
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

    fs.writeFileSync(
      path.join(__dirname, 'data.json'),
      JSON.stringify(rounds, null, 2)
    );
  });
