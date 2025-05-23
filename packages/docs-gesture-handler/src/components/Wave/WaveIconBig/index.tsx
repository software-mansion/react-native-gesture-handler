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
          className={styles.bigWave}
          xmlns="http://www.w3.org/2000/svg"
          width={windowWidth * (windowWidth < 996 ? 1.2 : 1)}
          fill="none"
          viewBox="0 0 2494 629">
          <g clipPath="url(#clip0_427_368)">
            <path
              fill={color}
              d="M2494.1 483.618v145.454c-51.38-25.717-105.21-50.673-161.45-74.756C1667.91 269.626 807.611 265.809 0 333V3.992c797.445-28.29 1616.75 93.494 2266.19 371.63 80.46 34.479 156.45 70.531 227.91 107.99v.006z"></path>
          </g>
          <defs>
            <clipPath id="clip0_427_368">
              <path fill="#fff" d="M0 0H2494V629H0z"></path>
            </clipPath>
          </defs>
        </svg>
      )}
    </BrowserOnly>
  );
}

export default Wave;
