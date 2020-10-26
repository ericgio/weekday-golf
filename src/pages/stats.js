import cx from 'classnames';
import orderBy from 'lodash/orderBy';
import filter from 'lodash/filter';
import mean from 'lodash/mean';
import values from 'lodash/values';
import sortBy from 'lodash/sortBy';
import min from 'lodash/min';
import map from 'lodash/map';
import roundTo from 'lodash/round';
import React, { useCallback, useState } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

import BestRoundsTable from '../components/BestRoundsTable';
import Layout from '../components/Layout';
import Table from '../components/Table';

import getAllData from '../data/getAllData';

import { HOLES, PAR, PLAYERS } from '../constants';

import {
  getAvgRoundScore,
  getHoleAvgs,
  getRecentPlayerRounds,
  getRoundsPlayed,
  getRoundsPlayedPercentage,
  getRoundsWonByPlayer,
  getRoundsWonPercentage,
  getTopRounds,
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
            <SortableHeader
              onClick={handleHeaderClick}
              order={order}
              selectedSortKey={selectedSortKey}
              sortKey="roundsWon">
              Rounds Won
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
            roundsWon,
            roundsWonPercentage,
            holeAvgs,
          }) => {
            const min = Math.min(...Object.values(holeAvgs));
            const max = Math.max(...Object.values(holeAvgs));
            const minHoles = HOLES.filter((hole) => holeAvgs[hole] === min);
            const maxHoles = HOLES.filter((hole) => holeAvgs[hole] === max);

            const dataCells = roundsPlayed === 0 ?
              <React.Fragment>
                <td>-</td>
                <td>{roundsPlayed} ({roundsPlayedPercentage}%)</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
              </React.Fragment> :
              <React.Fragment>
                <td>{roundAvg} (+{roundTo(roundAvg - PAR, 1)})</td>
                <td>{roundsPlayed} ({roundsPlayedPercentage}%)</td>
                <td>{roundsWon} ({roundsWonPercentage}%)</td>
                <td>{minHoles.join(', ')} ({min})</td>
                <td>{maxHoles.join(', ')} ({max})</td>
              </React.Fragment>;

            return (
              <tr key={name}>
                <td className={tableStyles.verticalHeader}>
                  {name}
                </td>
                {dataCells}
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
  const roundsWonByPlayer = getRoundsWonByPlayer(scores);

  const playerStats = PLAYERS.map(({ id, name }) => {
    const playerScores = filter(scores, { player: id });
    const recentRounds = getRecentPlayerRounds(rounds, id, RECENT_ROUND_COUNT);
    const recentPlayerScores = playerScores.filter(
      (score) => recentRounds.includes(score.round)
    );
    const roundsWon = roundsWonByPlayer[id] || 0;
    const roundsPlayed = getRoundsPlayed(rounds, id);

    return {
      id,
      name,
      holeAvgs: getHoleAvgs(playerScores),
      recentHoleAvgs: getHoleAvgs(recentPlayerScores),
      roundAvg: getAvgRoundScore(playerScores),
      roundsPlayed,
      roundsPlayedPercentage: getRoundsPlayedPercentage(rounds, id),
      roundsWon,
      roundsWonPercentage: getRoundsWonPercentage(roundsWon, roundsPlayed),
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
