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
    'legacy-gestures/fling-gesture',
    'legacy-gestures/force-touch-gesture',
    'legacy-gestures/gesture-composition',
    'legacy-gestures/gesture-detector',
    'legacy-gestures/gesture',
    'legacy-gestures/hover-gesture',
    'legacy-gestures/long-press-gesture',
    'legacy-gestures/manual-gesture',
    'legacy-gestures/native-gesture',
    'legacy-gestures/pan-gesture',
    'legacy-gestures/pinch-gesture',
    'legacy-gestures/rotation-gesture',
    'legacy-gestures/state-manager',
    'legacy-gestures/tap-gesture',
    'legacy-gestures/touch-events',
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
