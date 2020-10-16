import cx from 'classnames';
import {
  orderBy,
  filter,
  mean,
  values,
  sortBy,
  min,
  map,
  round as
  roundTo,
} from 'lodash';
import React, { useCallback, useState } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

import Layout from '../components/Layout';
import Table from '../components/Table';
import BestRoundsTable from '../components/BestRoundsTable';
import getAllData from '../data/getAllData';

import { HOLES, PAR, PLAYERS } from '../constants';

import {
  getAvgRoundScore,
  getRoundsPlayed,
  getRoundsPlayedPercentage,
  getTopRounds,
  getHoleAvgs,
  getRecentPlayerRounds,
} from '../data/utils';

import styles from './stats.module.scss';
import tableStyles from '../components/Table.module.scss';

/**
 * @typedef {import('../data/getAllData').Round} Round
 * @typedef {import('../data/utils').PlayerRoundSummary} PlayerRoundSummary
 */

const TRENDING_BUFFER = 0.2;
const TOP_ROUNDS = 10;
const MIN_ROUNDS = 3;
const RECENT_ROUND_COUNT = 8;

const Arrow = ({ className, dir, ...props }) => (
  <span
    {...props}
    className={cx(styles.arrow, className)}>
    {dir === 'up' ? '▲' : '▼'}
  </span>
);

const SortArrow = ({ order }) => (
  <Arrow dir={order === 'asc' ? 'up' : 'down'} />
);

const TrendArrow = ({ trend }) => {
  if (trend > TRENDING_BUFFER) {
    return <Arrow className={styles.trendingUp} dir="up" />;
  }

  if (trend < -TRENDING_BUFFER) {
    return <Arrow className={styles.trendingDown} dir="down" />;
  }

  return null;
};

const SortableHeader = ({
  children,
  className,
  onClick,
  order,
  selectedSortKey,
  sortKey,
}) => {
  const arrow = sortKey === selectedSortKey ?
    <SortArrow order={order} /> :
    null;

  return (
    <th
      className={cx(styles.sortable, className)}
      onClick={() => onClick(sortKey)}>
      {children} {arrow}
    </th>
  );
};

/**
 * @param {props} props
 */
const StatsPage = ({ rounds, topRounds, globalHoleAvgs, playerStats }) => {
  const [order, setOrder] = useState('asc');
  const [selectedSortKey, setSelectedSortKey] = useState('roundAvg');

  const handleHeaderClick = useCallback((sortKey) => {
    let newOrder = sortKey === 'roundsPlayed' ? 'desc' : 'asc';

    if (sortKey === selectedSortKey) {
      newOrder = order === 'asc' ? 'desc' : 'asc';
    }

    setOrder(newOrder);
    setSelectedSortKey(sortKey);
  });

  return (
    <Layout title="Stats">
      <h3>Stats By Player</h3>
      <Table>
        <thead>
          <tr>
            <SortableHeader
              className={tableStyles.verticalHeader}
              onClick={handleHeaderClick}
              order={order}
              selectedSortKey={selectedSortKey}
              sortKey="name">
              Name
            </SortableHeader>
            <SortableHeader
              onClick={handleHeaderClick}
              order={order}
              selectedSortKey={selectedSortKey}
              sortKey="roundAvg">
              Avg. Score
            </SortableHeader>
            <SortableHeader
              onClick={handleHeaderClick}
              order={order}
              selectedSortKey={selectedSortKey}
              sortKey="roundsPlayed">
              Rounds Played
            </SortableHeader>
            <th>Best Hole</th>
            <th>Worst Hole</th>
          </tr>
        </thead>
        <tbody>
          {orderBy(playerStats, [selectedSortKey], [order]).map(({
            name,
            roundAvg,
            roundsPlayed,
            roundsPlayedPercentage,
            holeAvgs,
          }) => {
            const min = Math.min(...Object.values(holeAvgs));
            const max = Math.max(...Object.values(holeAvgs));
            const minHoles = HOLES.filter((hole) => holeAvgs[hole] === min);
            const maxHoles = HOLES.filter((hole) => holeAvgs[hole] === max);

            return (
              <tr key={name}>
                <td className={tableStyles.verticalHeader}>
                  {name}
                </td>
                <td>{roundAvg} (+{roundTo(roundAvg - PAR, 1)})</td>
                <td>{roundsPlayed} ({roundsPlayedPercentage}%)</td>
                <td>{minHoles.join(', ')} ({min})</td>
                <td>{maxHoles.join(', ')} ({max})</td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      <h3>Average Score By Hole</h3>
      <div className={styles.avgScoreExplanation}>
        Most recent {RECENT_ROUND_COUNT} rounds, minimum {MIN_ROUNDS} rounds
      </div>
      <Table>
        <thead>
          <tr>
            <th className={tableStyles.verticalHeader}>
              Name
            </th>
            {HOLES.map((hole) => <th key={hole}>{hole}</th>)}
          </tr>
        </thead>
        <tbody>
          {sortBy(playerStats, [(stat) => mean(values(stat.recentHoleAvgs))])
            .filter((stat) => stat.roundsPlayed >= MIN_ROUNDS)
            .map(({ name, holeAvgs, recentHoleAvgs, roundsPlayed }, i, arr) => (
              <tr key={name}>
                <td className={tableStyles.verticalHeader}>
                  {name}
                </td>
                {HOLES.map((hole) => {
                  const bestRecentAvg = min(map(arr, `recentHoleAvgs.${hole}`));
                  const holeAvg = holeAvgs[hole];
                  const recentHoleAvg = recentHoleAvgs[hole];
                  const bestScore = recentHoleAvg === bestRecentAvg;

                  return (
                    <td
                      className={cx({
                        [tableStyles.bestScore]: bestScore,
                      })}
                      key={`avgHoleScore-${name}-${hole}`}>
                      <OverlayTrigger
                        overlay={
                          <Tooltip>
                            Recent: {recentHoleAvg}
                            <br />
                            All-time: {holeAvg}
                          </Tooltip>
                        }
                        placement="top">
                        <span>
                          {recentHoleAvg}
                          {' '}
                          <TrendArrow trend={recentHoleAvg - holeAvg} />
                        </span>
                      </OverlayTrigger>
                    </td>
                  );
                })}
              </tr>
            ))}
        </tbody>
        <thead>
          <tr>
            <th className={tableStyles.verticalHeader}>
              Overall
            </th>
            {HOLES.map((hole) => (
              <th key={hole}>
                {globalHoleAvgs[hole]}
              </th>
            ))}
          </tr>
        </thead>
      </Table>

      <h3>Best Rounds</h3>
      <BestRoundsTable topRounds={topRounds} rounds={rounds} />
    </Layout>
  );
};

/**
 * props
 * @typedef {{
 *   rounds: Round[],
 *   topRounds: PlayerRoundSummary[],
 *   globalHoleAvgs: Object<string, number>,
 *   playerStats: {
 *     id: string,
 *     name: string,
 *     roundAvg: number,
 *     roundsPlayed: number,
 *     roundsPlayedPercentage: number,
 *     holeAvgs: Object<string, number>,
 *     recentHoleAvgs: Object<string, number>,
 *   },
 * }} props
 *
 * @returns {{ props: props, revalidate: number }}
 */
export async function getStaticProps() {
  const { rounds, scores } = await getAllData();

  const topRounds = getTopRounds(scores, TOP_ROUNDS);
  const globalHoleAvgs = getHoleAvgs(scores);

  const playerStats = PLAYERS.map(({ id, name }) => {
    const playerScores = filter(scores, { player: id });
    const recentRounds = getRecentPlayerRounds(rounds, id, RECENT_ROUND_COUNT);
    const recentPlayerScores = playerScores.filter(
      (score) => recentRounds.includes(score.round)
    );

    return {
      id,
      name,
      roundAvg: getAvgRoundScore(playerScores),
      roundsPlayed: getRoundsPlayed(rounds, id),
      roundsPlayedPercentage: getRoundsPlayedPercentage(rounds, id),
      holeAvgs: getHoleAvgs(playerScores),
      recentHoleAvgs: getHoleAvgs(recentPlayerScores),
    };
  });

  return {
    props: {
      rounds,
      topRounds,
      globalHoleAvgs,
      playerStats,
    },
    revalidate: 30,
  };
}

export default StatsPage;
