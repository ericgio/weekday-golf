import moment from 'moment-timezone';
import React, { Fragment } from 'react';
import filter from 'lodash/filter';
import find from 'lodash/find';
import sumBy from 'lodash/sumBy';
import orderBy from 'lodash/orderBy';

import Layout from '../components/Layout';
import Table from '../components/Table';
import getAllRoundsAndScores from '../data/getAllRoundScores';

import { HOLES, PAR } from '../constants';

import './styles/Rounds.scss';

/**
 * @typedef {import('../data/types').Round} Round
 * @typedef {import('../data/types').Score} Score
 *
 * @param {{ rounds: Round[], scores: Score[] }} props
 */
const RoundsPage = (props) => {
  const { rounds, scores } = props;

  return (
    <Layout title="Rounds">
      {rounds.map(({ id, date, players, timezone }) => (
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
              {players.map((name) => {
                const playerRoundScores = filter(scores, { round: id, name });
                const roundTotal = sumBy(playerRoundScores, 'score');

                return (
                  <tr key={name}>
                    <td className="player-name">
                      {name}
                    </td>
                    {HOLES.map((hole) => (
                      <td key={`${date}-${name}-${hole}`}>
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
      ))}
    </Layout>
  );
};

export async function getStaticProps() {
  const { rounds, scores } = await getAllRoundsAndScores();

  return {
    props: {
      rounds: orderBy(rounds, ['date'], ['desc']),
      scores,
    },
    revalidate: 30,
  };
}

export default RoundsPage;
