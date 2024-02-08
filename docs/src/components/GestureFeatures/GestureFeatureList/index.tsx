import React, { Fragment } from 'react';
import styles from './styles.module.css';
import GestureFeatureItem from '@site/src/components/GestureFeatures/GestureFeatureItem';

const items = [
  {
    title: '120 FPS',
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  },
  {
    title: 'DECLARATIVE',
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  },
  {
    title: 'FEATURE',
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  },
];

const GestureFeatureList = () => {
  return (
    <div className={styles.featureList}>
      {items.map((item, idx) => (
        <GestureFeatureItem key={idx} title={item.title}>
          {item.body}
        </GestureFeatureItem>
      ))}
    </div>
  );
};

export default GestureFeatureList;
