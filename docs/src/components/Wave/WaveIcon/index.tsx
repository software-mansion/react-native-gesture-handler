import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import styles from './styles.module.css';
import useScreenSize from '@site/src/hooks/useScreenSize';

function Wave({ color }) {
  const { windowWidth } = useScreenSize();
  return (
    <BrowserOnly>
      {() => (
        <svg
          className={styles.wave}
          xmlns="http://www.w3.org/2000/svg"
          width={windowWidth * (windowWidth < 996 ? 1.2 : 1)}
          fill="none"
          viewBox="0 0 1440 1051">
          <path
            fill={color}
            d="M2041.08 808.08v243.04c-42.05-42.97-86.1-84.67-132.12-124.91C1364.96 450.52 660.92 275.6 0 387.87V6.67C652.6-40.6 1323.09 162.89 1854.57 627.63c65.84 57.61 128.03 117.85 186.51 180.44v.01z"></path>
        </svg>
      )}
    </BrowserOnly>
  );
}

export default Wave;
