import React from 'react';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import { useColorMode } from '@docusaurus/theme-common';
import WaveIcon from '@site/src/components/Wave/WaveIcon';
import WaveIconBig from '@site/src/components/Wave/WaveIconBig';

const Wave = () => {
  const currentComponent =
    useColorMode().colorMode === 'dark' ? (
      <>
        <WaveIcon color="var(--swm-purple-dark-120)" />
        <WaveIconBig color="var(--swm-purple-dark-120)" />
      </>
    ) : (
      <>
        <WaveIcon color="var(--swm-blue-light-40)" />
        <WaveIconBig color="var(--swm-blue-light-40)" />
      </>
    );
  return <>{ExecutionEnvironment.canUseViewport && currentComponent}</>;
};

export default Wave;
