import React from 'react';
import { orderBy } from 'lodash';

import Layout from '../components/Layout';
import RoundsChart from '../components/Chart/RoundsChart';
import RoundTable from '../components/RoundTable';

import getAllData from '../data/getAllData';
import { getPlayerRoundSummaries } from '../data/utils';

/**
 * @typedef {import('../data/getAllData').Round} Round
 * @typedef {import('../data/getAllData').Score} Score
 *
 * @param {{ rounds: Round[], scores: Score[] }} props
 */
const RoundsPage = ({ rounds, scores }) => (
  <Layout title="Rounds">
    <RoundsChart data={getPlayerRoundSummaries(scores)} />
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
