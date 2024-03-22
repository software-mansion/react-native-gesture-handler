import { Grid } from '@mui/material';
import React, { LegacyRef, Ref } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle, Text } from 'react-native';
import { State } from './ChartManager';

type ChartElementProps = {
  id: number;
  state: State;
  label?: string; // optional subtext
  position?: null; // todo
  innerRef?: LegacyRef<View>;
  style?: StyleProp<ViewStyle>;
  visible?: boolean;
};

export default function App({
  state,
  label, // optional subtext
  innerRef,
  style,
  visible,
}: ChartElementProps) {
  return (
    <Grid item style={styles.box} xs={3}>
      <View
        style={[styles.element, style, visible ? null : styles.hidden]}
        ref={innerRef}>
        <Text style={styles.header}>{state}</Text>
      </View>
      <Text style={styles.subtext}>{label}</Text>
    </Grid>
  );
}

const styles = StyleSheet.create({
  box: {
    flex: 1,
    flexDirection: 'column',
    textAlign: 'center',
    maxWidth: 270,
  },
  element: {
    padding: 16,
    backgroundColor: '#b58df1',
  },
  header: {
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
