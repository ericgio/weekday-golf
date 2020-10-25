import cx from 'classnames';
import * as d3 from 'd3';
import groupBy from 'lodash/groupBy';
import React, { useEffect, useRef, useState } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { parseISO, format } from 'date-fns';

import Axis from './Axis';
import Line from './Line';

import { getPlayerInfo } from '../../data/utils';

import styles from './styles/RoundsChart.module.scss';

const useResizeObserver = (
  containerRef,
  initialSize = { height: 0, width: 0 }
) => {
  const [size, setSize] = useState(initialSize);

  useEffect(() => {
    const containerElem = containerRef.current;

    if (!containerElem) {
      return;
    }

    const observer = new ResizeObserver(() => {
      setSize({
        height: containerElem.clientHeight,
        width: containerElem.clientWidth,
      });
    });

    observer.observe(containerElem);

    return () => observer.unobserve(containerElem);
  }, [containerRef]);

  return size;
};

const translate = (x, y) => `translate(${x}, ${y})`;

const COLORS = d3.schemeCategory10;
const HEIGHT = 360;
const MARGIN = {
  bottom: 24,
  left: 8,
  right: 8,
  top: 16,
};

const parseTime = d3.timeParse('%Y-%m-%d');

const RoundsChart = ({ data }) => {
  const ref = useRef(null);
  const { height, width } = useResizeObserver(ref);

  const innerHeight = height - MARGIN.top - MARGIN.bottom;
  const innerWidth = width - MARGIN.left - MARGIN.right;

  const players = groupBy(data, 'player');

  const xScale = d3.scaleTime()
    .domain(d3.extent(data, (d) => parseTime(d.round)))
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

  return (
    <div className={styles.container} ref={ref}>
      <svg
        height={HEIGHT}
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
          {Object.keys(players).map((id, idx) => (
            <React.Fragment key={id}>
              <Line
                data={players[id]}
                stroke={COLORS[idx]}
                x={(d) => xScale(parseTime(d.round))}
                y={(d) => yScale(d.total)}
              />
              {players[id].map(({ round, total }) => {
                // TODO: don't use round id as a date. Pull the round object
                // and use its `date` field instead.
                const date = format(parseISO(round), 'MMM do, y');

                // Don't display the player's name on their profile page.
                const name = Object.keys(players).length > 1 ?
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
                        {total}
                      </Tooltip>
                    }
                    placement="top">
                    <circle
                      cx={xScale(parseTime(round))}
                      cy={yScale(total)}
                      fill={COLORS[idx]}
                      r={4}
                    />
                  </OverlayTrigger>
                );
              })}
            </React.Fragment>
          ))}
        </g>
      </svg>
    </div>
  );
};

export default RoundsChart;
