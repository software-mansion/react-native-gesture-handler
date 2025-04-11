import React from 'react';
import styles from './styles.module.css';
import GestureFeatureItem from '@site/src/components/GestureFeatures/GestureFeatureItem';

const items = [
  {
    title: 'native gesture recognizers',
    body: 'With Gesture Handler touch stream handling happens on the UI thread and uses APIs native to each platform.',
  },
  {
    title: 'native components',
    body: 'Gesture Handler library ships with a set of components that aim to provide best possible interations such as SwipeableRow or Drawer.',
  },
  {
    title: '120 FPS',
    body: 'Gesture Handler integrates tightly with Reanimated to allow you to build smooth gesture based experiences up to 120 fps.',
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
