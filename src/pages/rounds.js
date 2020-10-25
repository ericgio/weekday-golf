import groupBy from 'lodash/groupBy';
import orderBy from 'lodash/orderBy';
import React, { useState } from 'react';
import { Form } from 'react-bootstrap';

import Layout from '../components/Layout';
import RoundsChart from '../components/Chart/RoundsChart';
import RoundTable from '../components/RoundTable';

import getAllData from '../data/getAllData';
import { getPlayerInfo, getPlayerRoundSummaries } from '../data/utils';

/**
 * @typedef {import('../data/getAllData').Round} Round
 * @typedef {import('../data/getAllData').Score} Score
 *
 * @param {{ rounds: Round[], scores: Score[] }} props
 */
const RoundsPage = ({ rounds, scores }) => {
  const data = getPlayerRoundSummaries(scores);
  const players = Object.keys(groupBy(data, 'player'));

  const [selectedPlayers, setSelectedPlayers] = useState(players);
  const filteredData = data.filter(({ player }) => (
    selectedPlayers.includes(player)
  ));

  return (
    <Layout title="Rounds">
      <RoundsChart data={filteredData} />
      <div style={{ margin: '-20px 0 30px' }}>
        {players.map((id, idx) => {
          const checked = selectedPlayers.includes(id);
          return (
            <Form.Check
              checked={checked}
              id={id}
              inline
              key={id}
              label={getPlayerInfo(id).name}
              onChange={() => {
                const selected = checked ?
                  selectedPlayers.filter((pid) => pid !== id) :
                  selectedPlayers.concat([id]);

                setSelectedPlayers(selected);
              }}
            />
          );
        })}
      </div>
      {rounds.map((round) => (
        <RoundTable key={round.id} round={round} scores={scores} />
      ))}
    </Layout>
  );
};

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
