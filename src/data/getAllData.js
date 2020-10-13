import { google } from 'googleapis';
import { first, sum, tail, zipObject } from 'lodash';

import { getPlayerInfo } from './utils';

const { GOOGLE_SHEETS_API_KEY, SPREADSHEET_ID } = process.env;

const CELL_RANGE = 'A1:J';
const RANGE_DATE_REGEX = new RegExp(`'(.*)T.*'!${CELL_RANGE}`, 'i');
const DEFAULT_COURSE = 'Mariners Point';
const DEFAULT_HOLE_PAR = 3;
const PAR_PLAYER_NAME = 'PAR';
const SKINS_TOKEN = '(s)';
const ROUND_SKIN_TOKEN = '(r)';

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
 *   holes: number[],
 *   pars: Object<string, number>,
 *   parTotal: number,
 *   players: string[],
 *   skinsPlayers: string[],
 *   roundSkinsPlayers: string[],
 * }} Round
 */

/**
 * A score on an individual hole
 * @typedef {{
 *   player: string,
 *   round: string,
 *   hole: number,
 *   par: number,
 *   score: number,
 * }} Score
 */

/**
 *
 * @param {{ range: string, values: string[][] }} valueRange
 * @returns {{ round: Round, roundScores: Score[] }}
 */
function parseRange({ range, values }) {
  const roundScores = [];
  const players = [];
  const skinsPlayers = [];
  const roundSkinsPlayers = [];

  // Pull the date from the sheet title (embedded in the range)
  const [, date] = RANGE_DATE_REGEX.exec(range);
  const roundId = date;

  // Pull the location from the first row
  const [courseRow, holesRow, ...scoreRows] = values;
  const location = first(courseRow) || DEFAULT_COURSE;

  // If there's row representing the par values for each hole, grab it
  const sheetHasParRow = scoreRows[0][0].includes(PAR_PLAYER_NAME);
  let pars = Array(9).fill(DEFAULT_HOLE_PAR);
  if (sheetHasParRow) {
    const parRow = scoreRows.shift();
    pars = tail(parRow).map((par) => parseInt(par, 10));
  }
  const holes = tail(holesRow).map((hole) => parseInt(hole, 10));

  scoreRows.forEach((scoreRow) => {
    const [playerKey, ...playerScores] = scoreRow;
    const playerId = getPlayerInfo(playerKey).id;
    players.push(playerId);
    if (playerKey.includes(SKINS_TOKEN)) {
      skinsPlayers.push(playerId);
    }
    if (playerKey.includes(ROUND_SKIN_TOKEN)) {
      roundSkinsPlayers.push(playerId);
    }

    playerScores.forEach((score, idx) => {
      roundScores.push({
        player: playerId,
        round: roundId,
        hole: holes[idx],
        par: pars[idx],
        score: parseInt(score, 10),
      });
    });
  });

  const round = {
    id: roundId,
    date,
    location,
    holes,
    pars: zipObject(holes, pars),
    parTotal: sum(pars),
    players,
    skinsPlayers,
    roundSkinsPlayers,
  };

  return { round, roundScores };
}

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
  data.valueRanges.forEach((valueRange) => {
    const { round, roundScores } = parseRange(valueRange);
    rounds.push(round);
    scores.push(...roundScores);
  });

  return { rounds, scores };
}
