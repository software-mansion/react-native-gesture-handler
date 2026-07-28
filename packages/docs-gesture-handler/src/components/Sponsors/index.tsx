import useBaseUrl from '@docusaurus/useBaseUrl';
import ThemedImage from '@theme/ThemedImage';
import React from 'react';

import styles from './styles.module.css';

const Sponsors = () => {
  const sponsorsLogos = {
    expo: {
      light: useBaseUrl('img/expo.svg'),
      dark: useBaseUrl('img/expo-dark.svg'),
    },
  };

  return (
    <div>
      <h2 className={styles.sponsorsTitle}>Sponsors</h2>

      {/* We decided to hid the sponsors copy until we came up with a better one */}

      {/* <p className={styles.sponsorsSubtitle}>
        Thanks to our Sponsors we can still develop our library and make the
        React Native world a better place!
      </p> */}
      <div className={styles.sponsorsBrand}>
        <ThemedImage sources={sponsorsLogos.expo} className={styles.sponsor} />
      </div>
    </div>
  );
};

export default Sponsors;
