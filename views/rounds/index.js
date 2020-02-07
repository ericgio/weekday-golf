import moment from 'moment-timezone';
import React, { Fragment } from 'react';

import Table from '../../components/Table';

import './RoundsView.scss';

const HOLES = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const PAR = 27;

function sortBy(key) {
  return (r1, r2) => {
    if (r1[key] < r2[key]) return 1;
    if (r1[key] > r2[key]) return -1;
    return 0;
  };
}

const RoundsView = ({ rounds }) => (
  <Fragment>
    {rounds.sort(sortBy('date')).map(({ date, players, timezone }) => (
      <Fragment key={date}>
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
            {players.map(({ name, scores, total }) => (
              <tr key={name}>
                <td className="player-name">
                  {name}
                </td>
                {scores.map(({ hole, score }) => (
                  <td key={`${date}-${name}-${hole}`}>
                    {score}
                  </td>
                ))}
                <td className="total">
                  {total} <span className="to-par">+{total - PAR}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Fragment>
    ))}
  </Fragment>
);

export default RoundsView;
