import cx from 'classnames';
import * as d3 from 'd3';
import React, { useRef } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

import Axis from './Axis';
import useResizeObserver from './useResizeObserver';

import { PLAYERS } from '../../constants';

import styles from './styles/ShotDistributionChart.module.scss';

const translate = (x, y) => `translate(${x}, ${y})`;

const getPlayerName = (id) => PLAYERS.find((p) => id === p.id).name;

const HEIGHT = 360;
const MARGIN = {
  bottom: 24,
  left: 0,
  right: 0,
  top: 16,
};

const scoresReducer = ({ data, players }, { player, score }) => {
  const key = score >= 8 ? '8+' : score;

  if (players.indexOf(player) === -1) {
    players.push(player);
  }

  if (!data[key]) {
    data[key] = {
      [player]: 1,
      score: key,
      total: 1,
    };
  } else if (!data[key][player]) {
    data[key][player] = 1;
    data[key].total += 1;
  } else {
    data[key][player] += 1;
    data[key].total += 1;
  }

  return { data, players };
};

const RoundsChart = ({ scores }) => {
  const ref = useRef(null);
  const { height, width } = useResizeObserver(ref);

  const innerHeight = height - MARGIN.top - MARGIN.bottom;
  const innerWidth = width - MARGIN.left - MARGIN.right;

  const { data, players } = scores.reduce(scoresReducer, {
    data: {},
    players: [],
  });

  const xScale = d3.scaleBand()
    .domain(Object.keys(data))
    .rangeRound([0, innerWidth])
    .padding(0.25);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(Object.values(data), (d) => d.total) + 15])
    .nice()
    .rangeRound([innerHeight, 0]);

  const colors = d3
    .scaleSequential(d3.interpolatePlasma)
    .domain([0, players.length * 0.9]);

  const xAxis = d3
    .axisBottom(xScale)
    .tickSize(6);

  const yAxis = d3
    .axisLeft(yScale)
    .ticks(5)
    .tickSize(3);

  const yAxisLines = d3
    .axisRight(yScale)
    .ticks(5)
    .tickSize(innerWidth);

  const stacked = d3.stack().keys(players)(Object.values(data));

  return (
    <div className={styles.container} ref={ref}>
      <svg
        height={HEIGHT}
        width={width}>
        <g transform={translate(MARGIN.left, MARGIN.top)}>
          <Axis
            axis={xAxis}
            className={cx(styles.xAxis)}
            transform={translate(0, innerHeight)}
          />
          <Axis
            axis={yAxisLines}
            className={cx(styles.yAxisLines)}
          />
          <Axis
            axis={yAxis}
            className={cx(styles.yAxis)}
          />
          {stacked.map((score, idx) => {
            const id = score.key;
            const name = getPlayerName(id);

            return (
              <g fill={colors(idx)} key={id}>
                {score.map((s) => {
                  return (
                    <OverlayTrigger
                      key={s.data.score}
                      overlay={
                        <Tooltip>
                          {name}
                          <br />
                          {s.data[id]}
                        </Tooltip>
                      }
                      placement="top">
                      <rect
                        height={Math.abs(yScale(s[0]) - yScale(s[1])) || 0}
                        width={xScale.bandwidth()}
                        x={xScale(s.data.score)}
                        y={yScale(s[1])}
                      />
                    </OverlayTrigger>
                  );
                })}
              </g>
            );
          })}
          {players.slice().map((id, idx) => (
            <g
              className={styles.legend}
              key={id}
              transform={translate(0, idx * 20)}>
              <rect
                fill={colors(idx)}
                height={19}
                width={19}
                x={innerWidth - 19}
              />
              <text
                dy=".35em"
                textAnchor="end"
                x={innerWidth - 24}
                y={9}>
                {getPlayerName(id)}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
};

export default RoundsChart;
