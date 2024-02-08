import React from 'react';
import styles from './styles.module.css';

import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import usePageType from '@site/src/hooks/usePageType';

const GestureSponsors = () => {
  const sponsorsLogos = {
    expo: {
      light: useBaseUrl('img/expo.svg'),
      dark: useBaseUrl('img/expo-dark.svg'),
    },
    shopify: {
      light: useBaseUrl('img/shopify.svg'),
      dark: useBaseUrl('img/shopify-dark.svg'),
    },
  };

  return (
    <div>
      <h2 className={styles.sponsorsTitle}>Sponsors</h2>
      <p className={styles.sponsorsSubtitle}>
        Thanks to our Sponsors we can still develop our library and make the
        React Native world a better place!
      </p>
      <div className={styles.sponsorsBrand}>
        <ThemedImage sources={sponsorsLogos.expo} className={styles.sponsor} />
        <ThemedImage
          sources={sponsorsLogos.shopify}
          className={styles.sponsor}
        />
      </div>
    </div>
  );
};

export default GestureSponsors;
