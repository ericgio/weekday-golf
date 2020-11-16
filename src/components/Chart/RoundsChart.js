import cx from 'classnames';
import * as d3 from 'd3';
import { parseISO, format } from 'date-fns';
import groupBy from 'lodash/groupBy';
import React, { useRef } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

import Axis from './Axis';
import Line from './Line';
import useResizeObserver from './useResizeObserver';

import { getPlayerInfo } from '../../data/utils';

import styles from './styles/RoundsChart.module.scss';

const round = d3.format('.1f');
const translate = (x, y) => `translate(${x}, ${y})`;

const HEIGHT = 360;
const MARGIN = {
  bottom: 24,
  left: 8,
  right: 8,
  top: 16,
};

const parseTime = d3.timeParse('%Y-%m-%d');

const RoundsChart = ({ data, height }) => {
  const ref = useRef(null);
  const { width } = useResizeObserver(ref);

  const innerHeight = height - MARGIN.top - MARGIN.bottom;
  const innerWidth = width - MARGIN.left - MARGIN.right;

  const players = groupBy(data, 'player');
  const [minDate, maxDate] = d3.extent(data, (d) => parseTime(d.round));
  const avgScore = round(d3.mean(data, (d) => d.total));

  const colors = d3
    .scaleSequential(d3.interpolatePlasma)
    .domain([0, Object.keys(players).length * 0.9]);

  const xScale = d3.scaleTime()
    .domain([minDate, maxDate])
    .rangeRound([0, innerWidth]);

  const yScale = d3.scaleLinear()
    .domain([
      d3.min(data, (d) => d.total) - 1,
      d3.max(data, (d) => d.total),
    ])
    .rangeRound([innerHeight, 0]);

  const xAxis = d3
    .axisBottom(xScale)
    .tickFormat((date) => (
      d3.timeYear(date) < date ?
        d3.timeFormat('%b')(date) :
        d3.timeFormat('%Y')(date)
    ))
    .tickSize(12);

  const yAxis = d3
    .axisLeft(yScale)
    .ticks(5)
    .tickSize(3);

  const isSinglePlayer = Object.keys(players).length === 1;

  return (
    <div className={styles.container} ref={ref}>
      <svg
        height={height}
        width={width}>
        <g transform={translate(MARGIN.left, MARGIN.top)}>
          <Axis
            axis={xAxis}
            className={cx(styles.axis, styles.xAxis)}
            transform={translate(0, innerHeight)}
          />
          <Axis
            axis={yAxis}
            className={cx(styles.axis, styles.yAxis)}
          />
          {Object.keys(players).map((id, idx) => {
            const color = colors(idx);
            // TODO: This assumes all rounds have the same par.
            const par = players[id][0].parTotal;

            return (
              <React.Fragment key={id}>
                {isSinglePlayer &&
                  <g className={styles.avgScore}>
                    <text
                      transform={translate(20, yScale(avgScore) - 5)}>
                      Avg. Score: {avgScore} (+{round(avgScore - par)})
                    </text>
                    <Line
                      data={[
                        { round: minDate, total: avgScore },
                        { round: maxDate, total: avgScore },
                      ]}
                      x={(d) => xScale(d.round)}
                      y={(d) => yScale(d.total)}
                    />
                  </g>}
                <Line
                  data={players[id]}
                  stroke={color}
                  x={(d) => xScale(parseTime(d.round))}
                  y={(d) => yScale(d.total)}
                />
                {players[id].map(({ round, total, parTotal }) => {
                  // TODO: don't use round id as a date. Pull the round object
                  // and use its `date` field instead.
                  const date = format(parseISO(round), 'MMM do, y');

                  // Don't display the player's name on their profile page.
                  const name = !isSinglePlayer ?
                    <React.Fragment>
                      {getPlayerInfo(id).name}<br />
                    </React.Fragment> :
                    null;

                  return (
                    <OverlayTrigger
                      key={`${id}-${round}`}
                      overlay={
                        <Tooltip>
                          {date}<br />
                          {name}
                          {total} (+{total - parTotal})
                        </Tooltip>
                      }
                      placement="top">
                      <circle
                        cx={xScale(parseTime(round))}
                        cy={yScale(total)}
                        fill={color}
                        r={4}
                      />
                    </OverlayTrigger>
                  );
                })}
              </React.Fragment>
            );
          })}
        </g>
      </svg>
    </div>
  );
};

RoundsChart.defaultProps = {
  height: HEIGHT,
};

export default RoundsChart;
