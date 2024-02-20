import React from 'react';
import Stars from '@site/src/components/Hero/Stars/StarsIcon';
import DarkStars from '@site/src/components/Hero/Stars/StarsIconDark';
import { useColorMode } from '@docusaurus/theme-common';
import styles from './styles.module.css';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

const HeroStars = () => {
  const currentComponent =
    useColorMode().colorMode === 'dark' ? <DarkStars /> : <Stars />;
  return (
    <div className={styles.stars}>
      {ExecutionEnvironment.canUseViewport && currentComponent}
    </div>
  );
};

export default HeroStars;
