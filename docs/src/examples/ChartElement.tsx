import { Grid } from '@mui/material';
import React, { LegacyRef, useEffect } from 'react';
import { StyleProp, StyleSheet, View, Text } from 'react-native';
import ChartManager, { ElementData, WAVE_DELAY_MS } from './ChartManager';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

type ChartElementProps = {
  elementData: ElementData;
  chartManager: ChartManager;
  innerRef?: LegacyRef<View>;
  style?: StyleProp<any>;
};

export default function ChartElement({
  elementData,
  chartManager,
  innerRef,
  style,
}: ChartElementProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (elementData.id != ChartManager.EMPTY_SPACE_ID) {
      const listenerId = chartManager.addListener(
        elementData.id,
        (isActive) => {
          progress.value = withSpring(isActive ? 1 : 0, {
            duration: 2 * WAVE_DELAY_MS,
          });
        }
      );

      return () => {
        chartManager.removeListener(elementData.id, listenerId);
      };
    }
  }, [chartManager]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor:
        progress.value > 0.5
          ? elementData.highlightColor
          : 'var(--ifm-background-color)',
      borderColor: progress.value > 0.5 ? 'transparent' : 'var(--swm-border)',
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      color:
        progress.value > 0.5
          ? 'var(--swm-navy-light-100)'
          : 'var(--swm-border)',
    };
  });

  return (
    <Grid item style={styles.box} xs={3}>
      <Animated.View
        style={[
          [styles.element, animatedStyle],
          elementData.isVisible ? null : styles.hidden,
          style,
        ]}
        ref={innerRef}>
        <Animated.Text style={[animatedTextStyle, styles.label, style]}>
          {elementData.label}
        </Animated.Text>
      </Animated.View>
      <Text style={styles.subtext}>{elementData.subtext}</Text>
    </Grid>
  );
}

const styles = StyleSheet.create({
  box: {
    flex: 1,
    flexDirection: 'column',
    textAlign: 'center',
    maxWidth: 900,
  },
  element: {
    paddingVertical: 16,
    backgroundColor: 'var(--ifm-background-color)',
    borderWidth: 1,
    borderColor: 'var(--swm-border)',
    transition: 'all 350ms ease-in-out',
  },
  label: {
    color: 'var(--swm-border)',
    transition: 'color 350ms ease-in-out',
    fontWeight: '500',
    fontSize: 22,
  },
  subtext: {
    fontWeight: '300',
    fontSize: 14,
    backgroundColor: 'var(--swm-off-background)',
  },
  hidden: {
    opacity: 0,
  },
});
