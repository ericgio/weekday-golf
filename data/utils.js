import {
  round,
  groupBy,
  sumBy,
  sortBy,
  orderBy,
  filter,
  first,
  last,
  isEmpty,
  zipObject,
} from 'lodash';

import { PLAYERS, HOLES } from '../constants';

export function getPlayerInfo(search) {
  search = search.toLowerCase();

  const player = PLAYERS.find(({ spreadsheetKey, id }) => (
    search.includes(spreadsheetKey) || id === search
  ));

  if (!player) throw Error(`Who let ${search} play?`);

  return player;
}

export function getAvg(numerator, denominator, precision = 1) {
  return round(numerator / denominator, precision);
}

/**
 * @typedef {import('./getAllData').Score} Score
 * @typedef {import('./getAllData').Round} Round
 */

/**
 * Stats for a player's round of golf
 * @typedef {{
 *   round: string,
 *   player: string,
 *   total: number,
 * }} PlayerRoundSummary
 */

/**
 * @param {Score[]} scores
 * @returns {PlayerRoundSummary[]}
 */
function getPlayerRoundSummaries(scores) {
  const groupedScores = groupBy(
    scores,
    ({ player, round }) => `${player}-${round}`
  );

  return Object.values(groupedScores).map((scoreList) => {
    const { round, player } = scoreList[0];
    const total = sumBy(scoreList, 'score');

    return { round, player, total };
  });
}

/**
 * @param {Score[]} scores
 * @param {number} limit
 * @returns {PlayerRoundSummary[]}
 */
export function getTopRounds(scores, limit) {
  const summaries = getPlayerRoundSummaries(scores);
  const topRounds = sortBy(summaries, ['total']);
  const losers = topRounds.splice(limit);

  // Move over any rounds that are tied for last place
  while (!isEmpty(losers) && last(topRounds).total === first(losers).total) {
    topRounds.push(losers.shift());
  }

  return topRounds;
}

/**
 * @param {Round[]} rounds
 * @param {string} player
 * @returns {number}
 */
export function getRoundsPlayed(rounds, player) {
  return rounds.filter(({ players }) => players.includes(player)).length;
}

/**
 *
 * @param {Round[]} rounds
 * @param {string} player
 * @param {number} limit
 * @returns {string[]} round ids
 */
export function getRecentPlayerRounds(rounds, player, limit) {
  const sortedRounds = orderBy(rounds, ['date'], ['desc']);
  return sortedRounds
    .filter((round) => round.players.includes(player))
    .slice(0, limit)
    .map((round) => round.id);
}

/**
 * @param {Round[]} rounds
 * @param {string} player
 * @returns {number}
 */
export function getRoundsPlayedPercentage(rounds, player) {
  const roundsPlayed = getRoundsPlayed(rounds, player);
  return round((roundsPlayed * 100) / rounds.length, 1);
}

/**
 * @param {Score[]} scores
 * @returns {number}
 */
export function getAvgRoundScore(scores) {
  const summaries = getPlayerRoundSummaries(scores);

  return getAvg(sumBy(summaries, 'total'), summaries.length);
}

/**
 * @param {Score[]} scores
 * @param {number} hole
 * @returns {number}
 */
export function getHoleAvg(scores, hole) {
  const holeScores = filter(scores, { hole });

  return getAvg(sumBy(holeScores, 'score'), holeScores.length);
}

/**
 * @param {Score[]} scores
 * @returns {Object<number, number>}
 */
export function getHoleAvgs(scores) {
  return zipObject(
    HOLES,
    HOLES.map((hole) => getHoleAvg(scores, hole)),
  );
}
