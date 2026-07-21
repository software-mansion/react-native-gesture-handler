import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { DocSidebar } from '@swmansion/t-rex-ui';

export default function DocSidebarWrapper(props) {
  const titleImages = {
    light: useBaseUrl('/img/title.svg'),
    dark: useBaseUrl('/img/title-dark.svg'),
  };

  const heroImages = {
    logo: useBaseUrl('/img/logo-hero.svg'),
    title: useBaseUrl('/img/title.svg'),
  };
  const newItems = ['components/touchable'];
  const deprecatedItems = [
    'components/buttons',
    'components/legacy-touchables',
  ];

  return (
    <DocSidebar
      newItems={newItems}
      deprecatedItems={deprecatedItems}
      heroImages={heroImages}
      titleImages={titleImages}
      {...props}
    />
  );
}
