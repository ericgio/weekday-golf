import cx from 'classnames';
import React from 'react';

import styles from './Topline.module.scss';

const Topline = ({ children, className }) => {
  return (
    <ul className={cx(styles.topline, className)}>
      {children}
    </ul>
  );
};

const ToplineItem = ({ annotation, children, label }) => {
  return (
    <li className={styles.toplineItem}>
      <div className={styles.toplineItemLabel}>
        {label}
      </div>
      <div className={styles.toplineItemData}>
        {children}
      </div>
      {annotation &&
        <div className={styles.toplineItemAnnotation}>
          {annotation}
        </div>}
    </li>
  );
};

Topline.Item = ToplineItem;

export default Topline;
