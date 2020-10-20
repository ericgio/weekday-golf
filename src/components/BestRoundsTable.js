import React from 'react';
import { round as roundTo, find } from 'lodash';
import { parseISO, format } from 'date-fns';

import Table from './Table';
import { getPlayerInfo } from '../data/utils';
import { PAR } from '../constants';

import tableStyles from './Table.module.scss';

/**
 * @typedef {import('../data/getAllData').Round} Round
 * @typedef {import('../data/utils').PlayerRoundSummary} PlayerRoundSummary
 */

/**
 * @param {{ rounds: Round[], topRounds: PlayerRoundSummary[] }} props
 */
export default function BestRoundsTable({ rounds, topRounds }) {
  let place = 1;

  return (
    <Table>
      <thead>
        <tr>
          <th className="text-left">Place</th>
          <th className={tableStyles.verticalHeader}>
            Name
          </th>
          <th>Score</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        {topRounds.map(({ round, player, total }, idx) => {
          const { date } = find(rounds, { id: round });
          const { name } = getPlayerInfo(player);

          if (idx > 0 && total !== topRounds[idx - 1].total) {
            place = idx + 1;
          }

          return (
            <tr key={`${name}-${date}`}>
              <td>{place}</td>
              <td className={tableStyles.verticalHeader}>{name}</td>
              <td>{total} (+{roundTo(total - PAR, 1)})</td>
              <td>
                {format(parseISO(date), 'MMMM do, y')}
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}
