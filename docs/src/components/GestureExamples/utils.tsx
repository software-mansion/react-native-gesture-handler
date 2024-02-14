import { StyleSheet } from 'react-native';
import { useColorMode } from '@docusaurus/theme-common';

export const RADIUS = 100;

const lightStyles = StyleSheet.create({
  circle: {
    backgroundColor: 'var(--swm-purple-light-100)',
    border: '8px solid var(--swm-purple-light-80)',
  },
});

const darkStyles = StyleSheet.create({
  circle: {
    backgroundColor: 'var(--swm-purple-light-100)',
    border: '8px solid var(--swm-purple-dark-100)',
  },
});

export const useStylesForExample = () => {
  return useColorMode().colorMode === 'dark' ? darkStyles : lightStyles;
};

export function isInsideCircle(offsetX, offsetY, centerX?, centerY?) {
  if (centerX !== undefined && centerY !== undefined) {
    const dx = offsetX - centerX;
    const dy = offsetY - centerY;
    return dx * dx + dy * dy <= RADIUS * RADIUS;
  } else {
    return offsetX * offsetX + offsetY * offsetY <= RADIUS * RADIUS;
  }
}
