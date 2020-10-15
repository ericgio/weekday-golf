import cx from 'classnames';
import React from 'react';
import { Table as RBTable } from 'react-bootstrap';

import styles from './Table.module.scss';

const Table = ({ className, ...props }) => (
  <RBTable
    {...props}
    className={cx(styles.appTable, className)}
  />
);

Table.defaultProps = {
  responsive: true,
  size: 'sm',
};

export default Table;
