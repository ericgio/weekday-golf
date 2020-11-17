import filter from 'lodash/filter';
import find from 'lodash/find';
import map from 'lodash/map';
import round from 'lodash/round';
import some from 'lodash/some';
import sum from 'lodash/sum';
import React from 'react';

import BestRoundsTable from '../../components/BestRoundsTable';
import Layout from '../../components/Layout';
import ProfileImage from '../../components/ProfileImage';
import RoundsChart from '../../components/Chart/RoundsChart';
import RoundTable from '../../components/RoundTable';
import Topline from '../../components/Topline';

import getAllData from '../../data/getAllData';
import {
  getHoleAvgStats,
  getPlayerRoundSummaries,
  getPlayerStats,
  getTopRounds,
} from '../../data/utils';

import { PLAYERS } from '../../constants';

import styles from '../styles/players.module.scss';

const COURSE = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((hole) => ({ hole, par: 3 }));
const TOP_ROUNDS = 5;

const holes = map(COURSE, 'hole');
const pars = map(COURSE, 'par');

export default function PlayerPage({
  player,
  playerStats,
  roundsSummary,
  roundsWithPlayer,
  scoresWithPlayer,
  topRounds,
}) {
  const { name, fbId } = player;
  const {
    holeAvgs,
    roundAvg,
    roundsPlayed,
    roundsPlayedPercentage,
    roundsWon,
    roundsWonPercentage,
  } = playerStats;

  const { max, maxHoles, min, minHoles } = getHoleAvgStats(holeAvgs, holes);

  return (
    <Layout title={name}>
      <h1 className={styles.header}>
        <ProfileImage
          className={styles.headerImage}
          fbId={fbId}
          roundedCircle
        />
        {name}
      </h1>
      <Topline>
        <Topline.Item label="Avg. Score">
          {roundAvg} (+{round(roundAvg - sum(pars), 1)})
        </Topline.Item>
        <Topline.Item label="Rounds Played">
          {roundsPlayed} ({roundsPlayedPercentage}%)
        </Topline.Item>
        <Topline.Item label="Rounds Won">
          {roundsWon} ({roundsWonPercentage}%)
        </Topline.Item>
        <Topline.Item label="Best Hole">
          {minHoles.join(', ')} ({min})
        </Topline.Item>
        <Topline.Item label="Worst Hole">
          {maxHoles.join(', ')} ({max})
        </Topline.Item>
      </Topline>
      <h3>Best Rounds</h3>
      <BestRoundsTable topRounds={topRounds} rounds={roundsWithPlayer} />
      <RoundsChart data={roundsSummary} height={210} />
      {roundsWithPlayer.map((round) => (
        <RoundTable key={round.id} round={round} scores={scoresWithPlayer} />
      ))}
    </Layout>
  );
}

export async function getStaticProps({ params: { id } }) {
  const { rounds, scores } = await getAllData();
  const player = find(PLAYERS, { id });

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
      player,
      playerStats: getPlayerStats(player, rounds, scores),
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
