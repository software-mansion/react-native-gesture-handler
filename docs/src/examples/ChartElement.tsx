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

export default function App({
  elementData,
  chartManager,
  innerRef,
  style,
}: ChartElementProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (
      elementData.id != ChartManager.EMPTY_SPACE_ID &&
      !elementData.isHeader
    ) {
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
    <Grid
      item
      style={elementData.isHeader ? styles.headerBox : styles.box}
      xs={3}>
      <Animated.View
        style={[
          elementData.isHeader ? null : [styles.element, animatedStyle],
          elementData.isVisible ? null : styles.hidden,
          style,
        ]}
        ref={innerRef}>
        <Animated.Text
          style={[
            animatedTextStyle,
            elementData.isHeader ? styles.headerText : styles.label,
            style,
          ]}>
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
  headerBox: {
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
    transition: 'background-color 200ms ease-in-out',
  },
  headerText: {
    fontSize: 30,
    fontWeight: '600',
    fontFamily: 'var(--ifm-heading-font-family)',
    color: 'var(--ifm-font-color-base)',
    margin: 12,
  },
  label: {
    color: 'var(--swm-border)',
    transition: 'color 200ms ease-in-out',
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
