import React from 'react';
import styles from './styles.module.css';
import { useColorMode } from '@docusaurus/theme-common';
import Planets from '@site/src/components/Hero/Planets/PlanetsIcon';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import DarkPlanets from '@site/src/components/Hero/Planets/PlanetsIconDark';

const HeroPlanets = () => {
  const currentComponent =
    useColorMode().colorMode === 'dark' ? <DarkPlanets /> : <Planets />;
  return (
    <div className={styles.planets}>
      {ExecutionEnvironment.canUseViewport && currentComponent}
    </div>
  );
};

export default HeroPlanets;
