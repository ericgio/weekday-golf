import React from 'react';
import { orderBy } from 'lodash';

import Layout from '../components/Layout';
import getAllData from '../data/getAllData';

import RoundTable from '../components/RoundTable';

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
