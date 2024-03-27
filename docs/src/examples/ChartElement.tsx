import { Grid } from '@mui/material';
import React, { LegacyRef, useEffect } from 'react';
import { StyleProp, StyleSheet, View, Text } from 'react-native';
import ChartManager, { ElementData } from './ChartManager';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

type ChartElementProps = {
  data: ElementData;
  chartManager: ChartManager;
  primaryColor: string;
  highlightColor: string;
  innerRef?: LegacyRef<View>;
  style?: StyleProp<any>;
};

export default function App({
  data,
  chartManager,
  primaryColor,
  highlightColor,
  innerRef,
  style,
}: ChartElementProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    // this listener is cleared through FlowChart
    if (data.id != ChartManager.EMPTY_SPACE && !data.isHeader) {
      const listenerId = chartManager.addListener(data.id, (isActive) => {
        progress.value = withSpring(isActive ? 1 : 0, { duration: 200 });
      });

      return () => {
        chartManager.removeListener(data.id, listenerId);
      };
    }
  }, [chartManager]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        progress.value,
        [0, 1],
        [primaryColor, highlightColor],
        'RGB'
      ),
    };
  });

  return (
    <Grid item style={data.isHeader ? styles.headerBox : styles.box} xs={3}>
      <Animated.View
        style={[
          data.isHeader ? null : [styles.element, animatedStyle],
          data.isVisible ? null : styles.hidden,
          style,
        ]}
        ref={innerRef}>
        <Text style={[data.isHeader ? styles.headerText : styles.label, style]}>
          {data.label}
        </Text>
      </Animated.View>
      <Text style={styles.subtext}>{data.subtext}</Text>
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
    backgroundColor: '#b58df1',
  },
  headerText: {
    fontSize: 30,
    fontWeight: '600',
    fontFamily: 'var(--ifm-heading-font-family)',
    margin: 12,
  },
  label: {
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
