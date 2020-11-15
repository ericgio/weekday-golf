import orderBy from 'lodash/orderBy';
import React from 'react';

import Layout from '../components/Layout';
import RoundTable from '../components/RoundTable';

import getAllData from '../data/getAllData';

/**
 * @typedef {import('../data/getAllData').Round} Round
 * @typedef {import('../data/getAllData').Score} Score
 *
 * @param {{ rounds: Round[], scores: Score[] }} props
 */
const RoundsPage = ({ rounds, scores }) => (
  <Layout title="Rounds">
    {rounds.map((round) => (
      <RoundTable key={round.id} round={round} scores={scores} />
    ))}
  </Layout>
);

export async function getStaticProps() {
  const { rounds, scores } = await getAllData();

  return {
    props: {
      rounds: orderBy(rounds, ['date'], ['desc']),
      scores,
    },
    revalidate: 30,
  };
}

export default RoundsPage;
