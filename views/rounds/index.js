import moment from 'moment';
import React, { Fragment } from 'react';
import { Table } from 'react-bootstrap';

import './RoundsView.scss';

const holes = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const RoundsView = ({ rounds }) => (
  <Fragment>
    {rounds.reverse().map(({ date, players }) => (
      <div key={date}>
        <h3>{moment(date).format('ddd MMMM Do, YYYY')}</h3>
        <Table className="round-table" size="sm">
          <thead>
            <tr>
              <th className="player-name">
                Name
              </th>
              {holes.map((hole) => (
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
                <td>+{total - 27}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    ))}
  </Fragment>
);

export default RoundsView;
