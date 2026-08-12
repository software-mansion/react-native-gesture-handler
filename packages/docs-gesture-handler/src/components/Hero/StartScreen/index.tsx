import AnnouncementChip from '@site/src/components/Hero/AnnouncementChip';
import HomepageButton from '@site/src/components/HomepageButton';
import React from 'react';

import styles from './styles.module.css';

const StartScreen = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.heading}>
        <div>
          <AnnouncementChip
            label="Gesture Handler v3 is out"
            linkLabel="What's new"
            href="https://swmansion.com/blog/introducing-gesture-handler-3-0-hook-based-api-deeper-reanimated-integration-more-9185b0c8e305/"
          />
          <h1 className={styles.headingLabel}>
            <span>React Native</span>
            <span>Gesture Handler</span>
          </h1>
          <h2 className={styles.subheadingLabel}>
            Declarative API exposing platform native touch and gesture system to
            React Native.
          </h2>
        </div>
        <div className={styles.lowerHeading}>
          <div className={styles.buttonContainer}>
            <HomepageButton
              href="/react-native-gesture-handler/docs/fundamentals/getting-started"
              title="Get started"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default StartScreen;
