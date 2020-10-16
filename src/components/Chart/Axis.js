import * as d3 from 'd3';
import React, { useEffect, useRef } from 'react';

const Axis = ({ axis, ...props }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      d3.select(containerRef.current).call(axis);
    }
  }, [axis]);

  return (
    <g
      {...props}
      ref={containerRef}
    />
  );
};

export default Axis;
