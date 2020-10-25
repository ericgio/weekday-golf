import cx from 'classnames';
import React from 'react';
import { Table as RBTable } from 'react-bootstrap';

import styles from './Table.module.scss';

const RowHeader = ({ as: AsComponent = 'td', className, ...props }) => (
  <AsComponent
    {...props}
    className={cx(styles.rowHeader, className)}
  />
);

const RowFooter = ({ as: AsComponent = 'td', className, ...props }) => (
  <AsComponent
    {...props}
    className={cx(styles.rowFooter, className)}
  />
);

const HighlightableCell = ({ highlight, className, ...props }) => (
  <td
    {...props}
    className={cx({ [styles.highlightCell]: highlight }, className)}
  />
);

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

export default Object.assign(
  Table,
  { RowHeader, RowFooter, HighlightableCell }
);
