import * as d3 from 'd3';
import React from 'react';

const Line = ({ data, x, y, ...props }) => {
  const line = d3
    .line()
    .x(x)
    .y(y);

  return (
    <path
      {...props}
      d={line(data)}
      fill="none"
    />
  );
};

export default Line;
