import cx from 'classnames';
import React from 'react';
import { Table as RBTable } from 'react-bootstrap';

import './Table.scss';

const Table = ({ className, ...props }) => (
  <RBTable
    {...props}
    className={cx('app-table', className)}
  />
);

Table.defaultProps = {
  responsive: true,
  size: 'sm',
};

export default Table;
