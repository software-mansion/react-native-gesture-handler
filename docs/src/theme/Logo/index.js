import React from 'react';
import LogoStyling from '@site/src/theme/Logo/LogoStyling';
import useBaseUrl from '@docusaurus/useBaseUrl';
import usePageType from '@site/src/hooks/usePageType';
import styles from './styles.module.css';

export default function LogoWrapper(props) {
  const { isLanding } = usePageType();

  const titleImages = {
    light: useBaseUrl('/img/title.svg'),
    dark: useBaseUrl('/img/title-dark.svg'),
  };

  const heroImages = {
    logo: useBaseUrl('/img/logo-hero.svg'),
    title: useBaseUrl('/img/title.svg'),
  };

  return (
    <div>
      <LogoStyling
        titleImages={titleImages}
        heroImages={heroImages}
        className={
          isLanding ? styles.navbar__logo_landing : styles.navbar__logo
        }
        titleClassName={styles.navbar__title}
      />
    </div>
  );
}
