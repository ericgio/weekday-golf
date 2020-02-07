import moment from 'moment-timezone';
import React, { Fragment } from 'react';
import { Table } from 'react-bootstrap';

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
      <div key={date}>
        <h3>{moment.tz(date, timezone).format('ddd MMMM Do, YYYY')}</h3>
        <Table className="round-table" size="sm">
          <thead>
            <tr>
              <th className="player-name">
                Name
              </th>
              {HOLES.map((hole) => (
                <th key={`hole-${hole}`}>{hole}</th>
              ))}
              <th colSpan="2">
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
                <td>{total}</td>
                <td>+{total - PAR}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    ))}
  </Fragment>
);

export default RoundsView;
