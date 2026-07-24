import GestureFeatureList from '@site/src/components/GestureFeatures/GestureFeatureList';
import HomepageButton from '@site/src/components/HomepageButton';
import React from 'react';

import styles from './styles.module.css';

const GestureFeatures = () => {
  return (
    <div className={styles.featuresContainer}>
      <h2 className={styles.title}>Why Gesture Handler?</h2>
      <GestureFeatureList />
      <div className={styles.learnMoreSection}>
        <p>
          Learn more about the features in the newest article about Gesture
          Handler
        </p>
        <HomepageButton
          target="_blank"
          href="https://swmansion.com/blog/introducing-gesture-handler-3-0-hook-based-api-deeper-reanimated-integration-more-9185b0c8e305/"
          title="See blog post"
          backgroundStyling={styles.featuresButton}
        />
      </div>
    </div>
  );
};

export default GestureFeatures;
