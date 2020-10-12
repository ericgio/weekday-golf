import { filter, find, some } from 'lodash';
import React from 'react';

import getAllData from '../../data/getAllData';
import { getTopRounds } from '../../data/utils';
import Layout from '../../components/Layout';
import BestRoundsTable from '../../components/BestRoundsTable';

import { PLAYERS } from '../../constants';
import RoundTable from '../../components/RoundTable';

const TOP_ROUNDS = 5;

export default function PlayerPage({
  playerInfo,
  topRounds,
  roundsWithPlayer,
  scoresWithPlayer,
}) {
  const { name } = playerInfo;

  return (
    <Layout title={name}>
      <h1>{name}</h1>
      <h3>Best Rounds</h3>
      <BestRoundsTable topRounds={topRounds} rounds={roundsWithPlayer} />

      {roundsWithPlayer.map((round) => (
        <RoundTable key={round.id} round={round} scores={scoresWithPlayer} />
      ))}
    </Layout>
  );
}

export async function getStaticProps({ params: { id } }) {
  const { rounds, scores } = await getAllData();
  const playerInfo = find(PLAYERS, { id });

  const playerScores = filter(scores, { player: id });
  const topRounds = getTopRounds(playerScores, TOP_ROUNDS);

  const roundsWithPlayer = rounds.filter(
    (round) => round.players.includes(id)
  );
  const scoresWithPlayer = scores.filter(
    (score) => some(roundsWithPlayer, { id: score.round })
  );

  return {
    props: {
      playerInfo,
      topRounds,
      roundsWithPlayer,
      scoresWithPlayer,
    },
    revalidate: 30,
  };
}

export function getStaticPaths() {
  return {
    paths: PLAYERS.map(({ id }) => ({ params: { id } })),
    fallback: false,
  };
}
