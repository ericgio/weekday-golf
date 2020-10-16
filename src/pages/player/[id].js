import { filter, find, some } from 'lodash';
import React from 'react';

import BestRoundsTable from '../../components/BestRoundsTable';
import Layout from '../../components/Layout';
import ProfileImage from '../../components/ProfileImage';
import RoundsChart from '../../components/Chart/RoundsChart';
import RoundTable from '../../components/RoundTable';

import getAllData from '../../data/getAllData';
import { getPlayerRoundSummaries, getTopRounds } from '../../data/utils';

import { PLAYERS } from '../../constants';

const TOP_ROUNDS = 5;

export default function PlayerPage({
  playerInfo,
  roundsSummary,
  roundsWithPlayer,
  scoresWithPlayer,
  topRounds,
}) {
  const { name, fbId } = playerInfo;

  return (
    <Layout title={name}>
      <h1>
        <ProfileImage fbId={fbId} roundedCircle />
        {name}
      </h1>
      <h3>Best Rounds</h3>
      <BestRoundsTable topRounds={topRounds} rounds={roundsWithPlayer} />
      <RoundsChart data={roundsSummary} />
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
      roundsSummary: getPlayerRoundSummaries(playerScores),
      roundsWithPlayer,
      scoresWithPlayer,
      topRounds,
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
