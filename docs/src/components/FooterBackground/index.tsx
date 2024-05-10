import React from 'react';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import usePageType from '@site/src/hooks/usePageType';
import { useColorMode } from '@docusaurus/theme-common';

import Moon from '@site/src/components/Moon/MoonIcon';
import DarkMoon from '@site/src/components/Moon/MoonIconDark';
import styles from './styles.module.css';

const FooterBackground = () => {
  const { isLanding } = usePageType();
  const currentSvgComponent =
    useColorMode().colorMode === 'dark' ? <DarkMoon /> : <Moon />;

  return (
    <div className={styles.moonContainer}>
      {isLanding && (
        <>{ExecutionEnvironment.canUseViewport && currentSvgComponent}</>
      )}
    </div>
  );
};

export default FooterBackground;
