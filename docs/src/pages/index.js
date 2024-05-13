import React from 'react';
import Layout from '@theme/Layout';
import styles from './styles.module.css';
import Wave from '@site/src/components/Wave';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import HomepageStartScreen from '@site/src/components/Hero/StartScreen';
import Playground from '@site/src/components/Playground';
import GestureFeatures from '@site/src/components/GestureFeatures';
import Testimonials from '@site/src/components/Testimonials';
import Sponsors from '@site/src/components/Sponsors';
import HireUsSection from '../components/HireUsSection';

function Home() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;

  return (
    <Layout
      title={`React Native Gesture Handler`}
      description="Declarative API exposing platform native touch and gesture system to React Native.">
      <div className={styles.container}>
        <HomepageStartScreen />
        <Playground />
      </div>
      <div className={styles.waveContainer}>
        <Wave />
      </div>
      <div className={styles.container}>
        <GestureFeatures />
        <Testimonials />
        <Sponsors />
        <HireUsSection />
      </div>
    </Layout>
  );
}

export default Home;
