import filter from 'lodash/filter';
import find from 'lodash/find';
import sumBy from 'lodash/sumBy';
import zipObject from 'lodash/zipObject';
import Link from 'next/link';
import React, { Fragment } from 'react';
import { parseISO, format } from 'date-fns';

import ProfileImage from './ProfileImage';
import Table from './Table';

import { getPlayerInfo, skinCountForHole } from '../data/utils';

import styles from './styles/RoundTable.module.scss';

const Skindicator = ({ count }) => {
  if (count < 2) {
    return null;
  }

  return (
    <sup className={styles.skin}>
      {count}
    </sup>
  );
};

/**
 * @typedef {import('../data/getAllData').Round} Round
 * @typedef {import('../data/getAllData').Score} Score
 *
 * @param {{ round: Round, scores: Score[] }} props
 */
export default function RoundTable({ round, scores }) {
  const { id, date, holes, parTotal, players, skinsPlayers } = round;
  const roundScores = filter(scores, { round: id });
  const skinsRoundsScores = filter(
    roundScores,
    (score) => skinsPlayers.includes(score.player)
  );

  return (
    <Fragment>
      <h3>{format(parseISO(date), 'EEEE MMM do, y')}</h3>
      <Table>
        <thead>
          <tr>
            <Table.RowHeader as="th">
              Name
            </Table.RowHeader>
            {holes.map((hole) => (
              <th key={`hole-${hole}`}>
                {hole}
              </th>
            ))}
            <Table.RowFooter as="th">
              Total
            </Table.RowFooter>
          </tr>
        </thead>
        <tbody>
          {players.map((player) => {
            const { id: playerId, name, fbId } = getPlayerInfo(player);
            const playerRoundScores = filter(roundScores, { player });
            const roundTotal = sumBy(playerRoundScores, 'score');
            const holeSkinCounts = zipObject(
              holes,
              holes.map(
                (hole) => skinCountForHole(skinsRoundsScores, player, hole)
              ),
            );

            return (
              <tr key={player}>
                <Table.RowHeader>
                  <Link href={`/player/${playerId}`}>
                    {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                    <a className="text-dark">
                      <ProfileImage
                        className="mr-1"
                        fbId={fbId}
                        height="26"
                        roundedCircle
                      />
                      {name}
                    </a>
                  </Link>
                </Table.RowHeader>
                {holes.map((hole) => (
                  <Table.HighlightableCell
                    highlight={!!holeSkinCounts[hole]}
                    key={`${date}-${player}-${hole}`}>
                    {find(playerRoundScores, { hole }).score}
                    <Skindicator count={holeSkinCounts[hole]} />
                  </Table.HighlightableCell>
                ))}
                <Table.RowFooter>
                  {roundTotal}
                  <span className="ml-2">+{roundTotal - parTotal}</span>
                </Table.RowFooter>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </Fragment>
  );
}
