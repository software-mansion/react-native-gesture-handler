/* eslint-disable import-x/extensions */
import { useColorMode } from '@docusaurus/theme-common';
import Arrow from '@site/static/img/Arrow.svg';
import ArrowDark from '@site/static/img/Arrow-dark.svg';
import clsx from 'clsx';
import React from 'react';

import styles from './styles.module.css';

const CollapseButton: React.FC<{
  label: string;
  expandedLabel: string;
  collapsed: boolean;
  onCollapse: () => void;
  className?: string;
}> = ({ label, expandedLabel, collapsed, onCollapse, className }) => {
  const { colorMode } = useColorMode();

  return (
    <div
      className={clsx(styles.collapseButton, className)}
      data-collapsed={collapsed}
      onClick={() => onCollapse()}>
      {colorMode === 'light' ? (
        <Arrow className={styles.arrow} />
      ) : (
        <ArrowDark className={styles.arrow} />
      )}

      <button type="button">{collapsed ? label : expandedLabel}</button>
    </div>
  );
};

export default CollapseButton;
