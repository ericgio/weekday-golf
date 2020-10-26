import round from 'lodash/round';
import groupBy from 'lodash/groupBy';
import sumBy from 'lodash/sumBy';
import sortBy from 'lodash/sortBy';
import orderBy from 'lodash/orderBy';
import filter from 'lodash/filter';
import first from 'lodash/first';
import last from 'lodash/last';
import isEmpty from 'lodash/isEmpty';
import zipObject from 'lodash/zipObject';
import map from 'lodash/map';

import { PLAYERS, HOLES } from '../constants';

export function getPlayerInfo(search) {
  search = search.toLowerCase();

  const player = PLAYERS.find(({ spreadsheetKey, id }) => (
    search.includes(spreadsheetKey) || id === search
  ));

  if (!player) {
    throw Error(`Who let ${search} play?`);
  }

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
export function getPlayerRoundSummaries(scores) {
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

export function getRoundsWonByPlayer(scores) {
  const byRound =
    getPlayerRoundSummaries(scores).reduce((acc, { round, player, total }) => {
      if (!acc[round] || total < acc[round].total) {
        acc[round] = {
          players: [player],
          total,
        };
      } else if (total === acc[round].total) {
        acc[round].players.push(player);
      }
      return acc;
    }, {});

  return Object.values(byRound).reduce((acc, { players }) => {
    players.forEach((player) => {
      if (!acc[player]) {
        acc[player] = 1;
      } else {
        acc[player] += 1;
      }
    });
    return acc;
  }, {});
}

export function getRoundsWonPercentage(roundsWon, roundsPlayed) {
  return round((roundsWon * 100) / roundsPlayed, 1);
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
 * @returns {Object<string, number>}
 */
export function getHoleAvgs(scores) {
  return zipObject(
    HOLES,
    HOLES.map((hole) => getHoleAvg(scores, hole)),
  );
}

/**
 * @param {Score[]} scores Scores for a specific hole in a round
 * @returns {undefined|string} id of player who won skin, or undefined if push
 */
function getSkinWinner(scores) {
  const minScore = Math.min(...map(scores, 'score'));
  const scoresOfMin = filter(scores, { score: minScore });

  if (scoresOfMin.length !== 1) {
    return undefined;
  }

  return first(scoresOfMin).player;
}

/**
 * @param {Score[]} scores All round scores for a people playing skins
 * @param {string} player id of a player to see how many skins they won
 * @param {number} hole The hole in question
 * @returns {number} The number of skins won by this player on this hole
 */
export function skinCountForHole(scores, player, hole) {
  const skinWinner = getSkinWinner(filter(scores, { hole }));
  if (!skinWinner || skinWinner !== player) {
    return 0;
  }

  // Great, this player won the current hole. Look back to see if there were
  // pushes leading up to this.
  let skinsWon = 1;
  let holeInQuestion = hole - 1;
  while (holeInQuestion > 0) {
    const earlierHoleScores = filter(scores, { hole: holeInQuestion });
    if (getSkinWinner(earlierHoleScores) !== undefined) {
      break;
    }
    skinsWon += 1;
    holeInQuestion -= 1;
  }

  return skinsWon;
}
