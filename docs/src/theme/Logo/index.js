import React from 'react';
import LogoStyling from '@site/src/theme/Logo/LogoStyling';
import useBaseUrl from '@docusaurus/useBaseUrl';
import usePageType from '@site/src/hooks/usePageType';
import styles from './styles.module.css';

export default function LogoWrapper(props) {
  const { isDocumentation, isLanding } = usePageType();

  const heroImages = {
    logo: useBaseUrl('/img/gesture-handler-logo.svg'),
    title: 'React Native\nGesture Handler',
  };

  return (
    <div>
      <LogoStyling
        heroImages={heroImages}
        className={
          isLanding ? styles.navbar__logo_landing : styles.navbar__logo
        }
        titleClassName={styles.navbar__title}
      />
    </div>
  );
}
