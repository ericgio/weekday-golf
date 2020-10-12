import React, { Fragment } from 'react';
import { filter, find, sumBy } from 'lodash';
import moment from 'moment-timezone';
import Link from 'next/link';

import Table from './Table';
import { getPlayerInfo } from '../data/utils';
import { HOLES, PAR } from '../constants';

import './RoundTable.scss';

/**
 * @typedef {import('../data/getAllData').Round} Round
 * @typedef {import('../data/getAllData').Score} Score
 *
 * @param {{ round: Round, scores: Score[] }} props
 */
export default function RoundTable({ round, scores }) {
  const { id, date, players, timezone } = round;

  return (
    <Fragment>
      <h3>{moment.tz(date, timezone).format('ddd MMMM Do, YYYY')}</h3>
      <Table className="round-table">
        <thead>
          <tr>
            <th className="player-name">
              Name
            </th>
            {HOLES.map((hole) => (
              <th key={`hole-${hole}`}>
                {hole}
              </th>
            ))}
            <th className="total">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {players.map((player) => {
            const playerRoundScores = filter(scores, { round: id, player });
            const roundTotal = sumBy(playerRoundScores, 'score');
            const { name, id: playerId } = getPlayerInfo(player);

            return (
              <tr key={player}>
                <td className="player-name">
                  <Link href={`/player/${playerId}`}>
                    {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                    <a>{name}</a>
                  </Link>
                </td>
                {HOLES.map((hole) => (
                  <td key={`${date}-${player}-${hole}`}>
                    {find(playerRoundScores, { hole }).score}
                  </td>
                ))}
                <td className="total">
                  {roundTotal}
                  <span className="to-par">+{roundTotal - PAR}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </Fragment>
  );
}
