import React from 'react';
import Planets from '@site/src/components/Hero/Planets';
import Stars from '@site/src/components/Hero/Stars';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import styles from './styles.module.css';

const LandingBackground = () => {
  return (
    <div className={styles.heroBackground}>
      {ExecutionEnvironment.canUseViewport && (
        <>
          <Planets />
          <Stars />
        </>
      )}
    </div>
  );
};

export default LandingBackground;
