import cx from 'classnames';
import * as d3 from 'd3';
import React, { useRef } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

import Axis from './Axis';
import useResizeObserver from './useResizeObserver';

import styles from './styles/ShotDistributionChart.module.scss';

const translate = (x, y) => `translate(${x}, ${y})`;

const HEIGHT = 360;
const MARGIN = {
  bottom: 24,
  left: 0,
  right: 0,
  top: 16,
};

const scoresReducer = (acc, { score }) => {
  const key = score >= 8 ? '8+' : score;

  if (!acc[key]) {
    acc[key] = 1;
  } else {
    acc[key] += 1;
  }

  return acc;
};

const RoundsChart = ({ scores }) => {
  const ref = useRef(null);
  const { height, width } = useResizeObserver(ref);

  const innerHeight = height - MARGIN.top - MARGIN.bottom;
  const innerWidth = width - MARGIN.left - MARGIN.right;

  const data = scores.reduce(scoresReducer, {});

  const xScale = d3.scaleBand()
    .domain(Object.keys(data))
    .rangeRound([0, innerWidth])
    .padding(0.25);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(Object.values(data)) + 15])
    .rangeRound([innerHeight, 0]);

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
          {Object.keys(data).map((k, idx) => {
            const value = data[k];
            return (
              <OverlayTrigger
                key={`${k}-${value}`}
                overlay={<Tooltip>{value}</Tooltip>}
                placement="top">
                <rect
                  fill={d3.schemeCategory10[0]}
                  height={Math.abs(innerHeight - yScale(value))}
                  width={xScale.bandwidth()}
                  x={xScale(k)}
                  y={yScale(value)}
                />
              </OverlayTrigger>
            );
          })}
        </g>
      </svg>
    </div>
  );
};

export default RoundsChart;
