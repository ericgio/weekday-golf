import cx from 'classnames';
import moment from 'moment-timezone';
import React, { useCallback, useState } from 'react';

import Layout from '../components/Layout';
import Table from '../components/Table';

import { HOLES } from '../constants';
import STATS from '../data/stats.json';

import './styles/Stats.scss';

const TRENDING_BUFFER = 0.2;

function sortBy(key) {
  return (r1, r2) => {
    if (r1[key] < r2[key]) return 1;
    if (r1[key] > r2[key]) return -1;
    return 0;
  };
}

function getMaxMinHoleScores(scoresByHole) {
  return Object
    .values(scoresByHole)
    .reduce((acc, { avgHoleScore, hole }) => {
      const { max, min } = acc;

      if (avgHoleScore === max.score) {
        max.holes.push(hole);
      }

      if (avgHoleScore === min.score) {
        min.holes.push(hole);
      }

      if (avgHoleScore > max.score) {
        max.holes = [hole];
        max.score = avgHoleScore;
      }

      if (avgHoleScore < min.score) {
        min.holes = [hole];
        min.score = avgHoleScore;
      }

      return { max, min };
    }, {
      max: {
        holes: [],
        score: 0,
      },
      min: {
        holes: [],
        score: 100,
      },
    });
}

const SortArrow = ({ order }) => (
  <span className="sortable-arrow">
    {order === 'asc' ? '▲' : '▼'}
  </span>
);

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
      className={cx('sortable', className)}
      onClick={() => onClick(sortKey)}>
      {children} {arrow}
    </th>
  );
};

const StatsPage = ({ stats }) => {
  const {
    globalScoresByHole,
    topRoundsByScore,
    statsByPlayer,
    MIN_ROUNDS,
  } = stats;

  const [order, setOrder] = useState('desc');
  const [selectedSortKey, setSelectedSortKey] = useState('avgScore');

  const data = statsByPlayer.slice().sort(sortBy(selectedSortKey));
  if (order === 'desc') {
    data.reverse();
  }

  const getBestRecentAvg = (statsByPlayer, hole) => {
    const recentHoleAvgs = statsByPlayer
      .filter(({ roundsPlayed }) => roundsPlayed >= MIN_ROUNDS)
      .map(({ scoresByHole }) => scoresByHole[hole].recentAvgHoleScore);
    return Math.min(...recentHoleAvgs);
  };

  const handleHeaderClick = useCallback((sortKey) => {
    let newOrder = sortKey === 'roundsPlayed' ? 'asc' : 'desc';

    if (sortKey === selectedSortKey) {
      newOrder = order === 'asc' ? 'desc' : 'asc';
    }

    setOrder(newOrder);
    setSelectedSortKey(sortKey);
  });

  return (
    <Layout title="Stats">
      <h3>Stats By Player</h3>
      <Table className="round-table">
        <thead>
          <tr>
            <SortableHeader
              className="player-name"
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
              sortKey="avgScore">
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
          {data.map(({
            name,
            avgScore,
            avgScoreToPar,
            roundsPlayed,
            roundsPlayedPercent,
            scoresByHole,
          }) => {
            const { max, min } = getMaxMinHoleScores(scoresByHole);

            return (
              <tr key={name}>
                <td className="player-name">
                  {name}
                </td>
                <td>{avgScore} (+{avgScoreToPar})</td>
                <td>{roundsPlayed} ({roundsPlayedPercent})</td>
                <td>{min.holes.join(', ')} ({min.score})</td>
                <td>{max.holes.join(', ')} ({max.score})</td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      <h3>Recent Average Scores By Hole (minimum {MIN_ROUNDS} rounds)</h3>
      <Table className="round-table">
        <thead>
          <tr>
            <th className="player-name">
              Name
            </th>
            {HOLES.map((hole) => <th key={hole}>{hole}</th>)}
          </tr>
        </thead>
        <tbody>
          {statsByPlayer.map(({ name, scoresByHole, roundsPlayed }) => {
            if (roundsPlayed < MIN_ROUNDS) {
              return null;
            }
            const arr = Object.values(scoresByHole);

            return (
              <tr key={name}>
                <td className="player-name">
                  {name}
                </td>
                {arr.map(({ hole, avgHoleScore, recentAvgHoleScore }) => {
                  const bestRecentAvg = getBestRecentAvg(statsByPlayer, hole);
                  const trend = recentAvgHoleScore - avgHoleScore;

                  return (
                    <td
                      className={cx({
                        'best-score': recentAvgHoleScore === bestRecentAvg,
                      })}
                      key={`avgHoleScore-${name}-${hole}`}
                      // eslint-disable-next-line max-len
                      title={`Recent: ${recentAvgHoleScore}, All-time: ${avgHoleScore}`}>
                      {recentAvgHoleScore}
                      {trend > TRENDING_BUFFER && (
                        <span className="trending-up">&nbsp;&#9650;</span>
                      )}
                      {trend < -TRENDING_BUFFER && (
                        <span className="trending-down">&nbsp;&#9660;</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
        <thead>
          <tr>
            <th className="player-name">
              Overall
            </th>
            {HOLES.map((hole) => (
              <th key={hole}>
                {globalScoresByHole[hole].avgHoleScore}
              </th>
            ))}
          </tr>
        </thead>
      </Table>

      <h3>Best Rounds</h3>
      <Table className="round-table">
        <thead>
          <tr>
            <th className="player-place">Place</th>
            <th className="player-name">
              Name
            </th>
            <th>Score</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {topRoundsByScore
            .map(({ date, place, name, timezone, toPar, total }) => (
              <tr key={`${name}-${date}`}>
                <td>{place}</td>
                <td className="player-name">{name}</td>
                <td>{total} (+{toPar})</td>
                <td>{moment.tz(date, timezone).format('MMMM Do, YYYY')}</td>
              </tr>
            ))}
        </tbody>
      </Table>
    </Layout>
  );
};

StatsPage.getInitialProps = () => ({ stats: STATS });

export default StatsPage;
