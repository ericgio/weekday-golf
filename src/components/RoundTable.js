import cx from 'classnames';
import { filter, find, sumBy, zipObject } from 'lodash';
import Link from 'next/link';
import React, { Fragment } from 'react';

import ProfileImage from './ProfileImage';
import Table from './Table';

import { getPlayerInfo, skinCountForHole } from '../data/utils';

import tableStyles from './Table.module.scss';

/**
 * @typedef {import('../data/getAllData').Round} Round
 * @typedef {import('../data/getAllData').Score} Score
 *
 * @param {{ round: Round, scores: Score[] }} props
 */
export default function RoundTable({ round, scores }) {
  const dateOptions = {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };
  const { id, date, holes, parTotal, players, skinsPlayers } = round;
  const roundScores = filter(scores, { round: id });
  const skinsRoundsScores = filter(
    roundScores,
    (score) => skinsPlayers.includes(score.player)
  );

  return (
    <Fragment>
      <h3>{new Date(date).toLocaleDateString(undefined, dateOptions)}</h3>
      <Table>
        <thead>
          <tr>
            <th className={tableStyles.verticalHeader}>
              Name
            </th>
            {holes.map((hole) => (
              <th key={`hole-${hole}`}>
                {hole}
              </th>
            ))}
            <th className={tableStyles.verticalFooter}>
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {players.map((player) => {
            const { id: playerId, name, fbId } = getPlayerInfo(player);
            const playerRoundScores = filter(roundScores, { player });
            const roundTotal = sumBy(playerRoundScores, 'score');
            const holeSkinCounts = zipObject(
              holes,
              holes.map(
                (hole) => skinCountForHole(skinsRoundsScores, player, hole)
              ),
            );

            return (
              <tr key={player}>
                <td className={tableStyles.verticalHeader}>
                  <Link href={`/player/${playerId}`}>
                    {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                    <a>
                      <ProfileImage fbId={fbId} height="26" roundedCircle />
                    </a>
                  </Link>
                  &nbsp;
                  <Link href={`/player/${playerId}`}>
                    {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                    <a className="text-dark">
                      {name}
                    </a>
                  </Link>
                </td>
                {holes.map((hole) => {
                  const skinCount = holeSkinCounts[hole];
                  return (
                    <td
                      className={cx({
                        [tableStyles.bestScore]: holeSkinCounts[hole],
                      })}
                      key={`${date}-${player}-${hole}`}>
                      {find(playerRoundScores, { hole }).score}
                      {skinCount > 1 && <sup>{skinCount}</sup>}
                    </td>
                  );
                })}
                <td className={tableStyles.verticalFooter}>
                  {roundTotal}
                  <span className="ml-2">+{roundTotal - parTotal}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </Fragment>
  );
}
