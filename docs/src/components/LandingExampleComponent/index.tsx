import React from 'react';

import BrowserOnly from '@docusaurus/BrowserOnly';
import styles from './styles.module.css';

interface Props {
  component: React.ReactNode;
  idx?: number;
}

export default function LandingExample({ component, idx }: Props) {
  return (
    <BrowserOnly fallback={<div>Loading...</div>}>
      {() => (
        <div id={`container-${idx}`} className={styles.container}>
          <React.Fragment key={idx}>{component}</React.Fragment>
        </div>
      )}
    </BrowserOnly>
  );
}
