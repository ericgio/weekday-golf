import Head from 'next/head';
import moment from 'moment';
import React, { Fragment } from 'react';
import { Container, Jumbotron, Tab, Table, Tabs } from 'react-bootstrap';

import DATA from '../data/data.json';

import './styles/Index.scss';

const holes = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const RoundsView = ({ rounds }) => (
  <Fragment>
    {rounds.map(({ date, players }) => (
      <div key={date}>
        <h3>{moment(date).format('ddd MMMM Do, YYYY')}</h3>
        <Table className="round-table" size="sm">
          <thead>
            <tr>
              <th className="player-name">
                Name
              </th>
              {holes.map((hole) => (
                <th key={`hole-${hole}`}>{hole}</th>
              ))}
              <th colSpan="2">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
          {players.map(({ name, scores, total }) => (
            <tr key={name}>
              <td className="player-name">
                {name}
              </td>
              {scores.map(({ hole, score }) => (
                <td key={`${date}-${name}-${hole}`}>
                  {score}
                </td>
              ))}
              <td>{total}</td>
              <td>+{total - 27}</td>
            </tr>
          ))}
          </tbody>
        </Table>
      </div>
    ))}
  </Fragment>
);

const IndexPage = ({ rounds }) => {
  const title = 'Weekday Golf';

  return (
    <Fragment>
      <Head>
        <title>{title}</title>
        <link
          rel="stylesheet"
          href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
          integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T"
          crossOrigin="anonymous"
        />
      </Head>
      <div className="index-page">
        <Jumbotron>
          <Container>
            <h1>🏌🏾‍♂ {title}</h1>
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
              nothing
            </Tab>
          </Tabs>
        </Container>
      </div>
    </Fragment>
  );
};

IndexPage.getInitialProps = () => {
  return {
    rounds: DATA,
  };
};

export default IndexPage;
