// credits to https://github.com/jmysliv for creating the template for Reanimated 2

import React, { useEffect, useRef, useState } from 'react';

import styles from './styles.module.css';
import clsx from 'clsx';

const MARGIN_BOTTOM = 60;
const Step = ({ children, title }) => {
  return (
    <div className={clsx(styles.container)}>
      <div className={clsx(styles.description)}>
        <div className={clsx(styles.roundedStep)}>
          <div className={clsx(styles.stepTitle)}>{title}</div>
          {children[0]}
        </div>
      </div>
      <div className={clsx(styles.code)}>{children[1]}</div>
    </div>
  );
};

export const Divider = () => {
  return <div className={clsx(styles.divider)}></div>;
}

export default Step;
