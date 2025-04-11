// credits to https://github.com/jmysliv for creating the template for Reanimated 2

import React from 'react';

import styles from './styles.module.css';

const Step = ({ children, title }) => {
  return (
    <div className={styles.container}>
      <div className={styles.description}>
        <div className={styles.step}>
          <div className={styles.stepTitle}>{title}</div>
          {children[0]}
        </div>
      </div>
      <div className={styles.code}>{children[1]}</div>
    </div>
  );
};

export default Step;
