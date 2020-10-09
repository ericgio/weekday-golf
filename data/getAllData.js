const { google } = require('googleapis');
const moment = require('moment-timezone');

const { normalizeName } = require('./utils');

const { GOOGLE_SHEETS_API_KEY, SPREADSHEET_ID } = process.env;

const CELL_RANGE = 'A3:J';
const TITLE_RANGE_REGEX = new RegExp(`'(.*)'!${CELL_RANGE}`, 'i');

// Initialize Sheets API.
const SheetsAPI = google.sheets({
  version: 'v4',
  auth: GOOGLE_SHEETS_API_KEY,
});

const options = {
  spreadsheetId: SPREADSHEET_ID,
};

/**
 * Overview data for a round of golf
 * @typedef {{
 *   id: string,
 *   date: string,
 *   location:string,
 *   timezone: string,
 *   players: string[]
 * }} Round
 */

/**
 * A score on an individual hole
 * @typedef {{
 *   name: string,
 *   round: string,
 *   hole: number,
 *   score: number,
 * }} Score
 */

/**
 * @returns {Promise<{ rounds: Round[], scores: Score[] }>}
 */
export default async function getAllData() {
  // Get overview information for spreadsheet (including list of sheet names)
  const { data: { sheets } } = await SheetsAPI.spreadsheets.get(options);

  // Request the relevant range from all the sheets at once
  const sheetTitles = sheets.map((sheet) => sheet.properties.title);
  const ranges = sheetTitles.map((title) => `'${title}'!${CELL_RANGE}`);
  const { data } = await SheetsAPI.spreadsheets.values.batchGet({
    ...options, ranges,
  });

  // Parse the sheet data into rounds and scores
  const rounds = [];
  const scores = [];
  data.valueRanges.forEach(({ range, values }) => {
    const [, title] = TITLE_RANGE_REGEX.exec(range);

    rounds.push({
      id: title,
      date: moment(title).format(),
      players: values.map((row) => normalizeName(row[0])),
      // TODO: Account for other locations.
      location: 'Mariner\'s Point',
      timezone: 'America/Los_Angeles',
    });

    values.forEach((row) => {
      const player = row.shift();

      row.forEach((score, idx) => {
        scores.push({
          name: normalizeName(player),
          round: title,
          hole: idx + 1,
          score: parseInt(score, 10),
        });
      });
    });
  });

  return { rounds, scores };
}
