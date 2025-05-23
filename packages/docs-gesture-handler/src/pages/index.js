import React from 'react';
import Layout from '@theme/Layout';
import styles from './styles.module.css';
import Wave from '@site/src/components/Wave';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import HomepageStartScreen from '@site/src/components/Hero/StartScreen';
import LandingBackground from '@site/src/components/Hero/LandingBackground';
import FooterBackground from '../components/FooterBackground';
import Playground from '@site/src/components/Playground';
import GestureFeatures from '@site/src/components/GestureFeatures';
import Testimonials from '@site/src/components/Testimonials';
import Sponsors from '@site/src/components/Sponsors';
import { HireUsSection } from '@swmansion/t-rex-ui';

function Home() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;

  return (
    <Layout
      title={`React Native Gesture Handler`}
      description="Declarative API exposing platform native touch and gesture system to React Native.">
      <LandingBackground />
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
        <HireUsSection
          href={
            'https://swmansion.com/contact/projects?utm_source=gesture-handler&utm_medium=docs'
          }
        />
      </div>
      <FooterBackground />
    </Layout>
  );
}

export default Home;
