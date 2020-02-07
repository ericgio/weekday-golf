import cx from 'classnames';
import moment from 'moment-timezone';
import React from 'react';

import Layout from '../components/Layout';
import Table from '../components/Table';

import { HOLES } from '../constants';
import STATS from '../data/stats.json';

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

const StatsPage = ({ stats }) => {
  const { globalScoresByHole, roundsByScore, statsByPlayer } = stats;

  return (
    <Layout title="Stats">
      <h3>Stats By Player</h3>
      <Table className="round-table">
        <thead>
          <tr>
            <th className="player-name">
              Name
            </th>
            <th>Rounds Played</th>
            <th>Avg. Score</th>
            <th>Best Hole</th>
            <th>Worst Hole</th>
          </tr>
        </thead>
        <tbody>
          {statsByPlayer.map(({
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
                <td>{roundsPlayed} ({roundsPlayedPercent})</td>
                <td>{avgScore} (+{avgScoreToPar})</td>
                <td>{min.holes.join(', ')} ({min.score})</td>
                <td>{max.holes.join(', ')} ({max.score})</td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      <h3>Average Score By Hole</h3>
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
          {statsByPlayer.map(({ name, scoresByHole }) => {
            const arr = Object.values(scoresByHole);

            return (
              <tr key={name}>
                <td className="player-name">
                  {name}
                </td>
                {arr.map(({ hole, avgHoleScore }) => {
                  const { bestScore } = globalScoresByHole[hole];
                  return (
                    <td
                      className={cx({
                        'best-score': avgHoleScore === bestScore,
                      })}
                      key={`avgHoleScore-${name}-${hole}`}>
                      {avgHoleScore}
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
            <th className="player-name">
              Name
            </th>
            <th>Score</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {roundsByScore
            .slice(0, 10)
            .map(({ date, name, timezone, toPar, total }) => (
              <tr key={`${name}-${date}`}>
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
