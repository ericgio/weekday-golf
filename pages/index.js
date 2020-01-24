import Head from 'next/head';
import { useRouter } from 'next/router';
import { stringify } from 'qs';
import React, { Fragment } from 'react';
import { Container, Jumbotron, Tab, Tabs } from 'react-bootstrap';

import RoundsView from '../views/rounds';
import StatsView from '../views/stats';

import ROUNDS from '../data/rounds.json';
import STATS from '../data/stats.json';

import './styles/Index.scss';

const DEFAULT_TAB = 'rounds';

const Emoji = () => (
  <span aria-label="weekday-golf" role="img">🏌🏾‍♂</span>
);

const IndexPage = ({ rounds, stats }) => {
  const title = 'Weekday Golf';
  const { pathname, query, ...router } = useRouter();
  const activeTab = query.t || DEFAULT_TAB;
  const [asPath] = router.asPath.split('?');

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
            activeKey={activeTab}
            className="content-tabs"
            id="tabs"
            onSelect={(t) => {
              const query = { t };
              router.push(
                { pathname, query },
                `${asPath}?${stringify(query)}`
              );
            }}
            transition={false}
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

IndexPage.getInitialProps = ({ query }) => {
  return {
    rounds: ROUNDS,
    stats: STATS,
  };
};

export default IndexPage;
