import React from 'react';
import styles from './styles.module.css';
import HomepageButton from '@site/src/components/HomepageButton';

const StartScreen = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.heading}>
        <div>
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
              href="/react-native-gesture-handler/docs/"
              title="Get started"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default StartScreen;
