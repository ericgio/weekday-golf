import { google } from 'googleapis';

import { getPlayerInfo } from './utils';

const { GOOGLE_SHEETS_API_KEY, SPREADSHEET_ID } = process.env;

const CELL_RANGE = 'A3:J';
const RANGE_DATE_REGEX = new RegExp(`'(.*)T.*'!${CELL_RANGE}`, 'i');

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
 *   players: string[]
 * }} Round
 */

/**
 * A score on an individual hole
 * @typedef {{
 *   player: string,
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
    const [, date] = RANGE_DATE_REGEX.exec(range);
    const roundId = date;
    const roundPlayers = [];

    values.forEach((row) => {
      const playerKey = row.shift();
      const { id: playerId } = getPlayerInfo(playerKey);
      roundPlayers.push(playerId);

      row.forEach((score, idx) => {
        scores.push({
          player: playerId,
          round: roundId,
          hole: idx + 1,
          score: parseInt(score, 10),
        });
      });
    });

    rounds.push({
      id: roundId,
      date,
      players: roundPlayers,
      location: 'Mariner\'s Point',
    });
  });

  return { rounds, scores };
}
