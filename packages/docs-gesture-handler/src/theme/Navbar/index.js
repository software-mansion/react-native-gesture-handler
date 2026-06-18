import { useLocation } from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { TOP_BAR_BANNER } from '@site/src/components/topBarBannerConfig';
import { isBannerHidden, Navbar, TopbarBanner } from '@swmansion/t-rex-ui';
import React from 'react';

export default function NavbarWrapper(props) {
  const location = useLocation();
  const bannerHidden = isBannerHidden(
    location.pathname,
    TOP_BAR_BANNER.hiddenPaths
  );

  const titleImages = {
    light: useBaseUrl('/img/title.svg'),
    dark: useBaseUrl('/img/title-dark.svg'),
  };

  const heroImages = {
    logo: useBaseUrl('/img/logo-hero.svg'),
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      {!bannerHidden && (
        <TopbarBanner
          zones={TOP_BAR_BANNER.zones}
          rotateIntervalMs={TOP_BAR_BANNER.rotateIntervalMs}
        />
      )}
      <Navbar heroImages={heroImages} titleImages={titleImages} {...props} />
    </div>
  );
}
