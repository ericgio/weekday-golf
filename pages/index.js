import Head from 'next/head';
import React, { Fragment } from 'react';
import { Container, Jumbotron, Tab, Tabs } from 'react-bootstrap';

import RoundsView from '../components/RoundsView';
import StatsView from '../components/StatsView';

import ROUNDS from '../data/rounds.json';
import STATS from '../data/stats.json';

import './styles/Index.scss';

const Emoji = () => (
  <span aria-label="weekday-golf" role="img">🏌🏾‍♂</span>
);

const IndexPage = ({ rounds, stats }) => {
  const title = 'Weekday Golf';

  return (
    <Fragment>
      <Head>
        <title>{title}</title>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossOrigin="anonymous" />
      </Head>
      <div className="index-page">
        <Jumbotron>
          <Container>
            <h1>
              <Emoji /> {title}
            </h1>
          </Container>
        </Jumbotron>
        <Container>
          <Tabs
            className="content-tabs"
            defaultActiveKey="rounds"
            id="tabs"
            variant="tabs">
            <Tab eventKey="rounds" title="Rounds">
              <RoundsView rounds={rounds} />
            </Tab>
            <Tab eventKey="stats" title="Stats">
              <StatsView {...stats} />
            </Tab>
          </Tabs>
        </Container>
      </div>
    </Fragment>
  );
};

IndexPage.getInitialProps = () => {
  return {
    rounds: ROUNDS,
    stats: STATS,
  };
};

export default IndexPage;
