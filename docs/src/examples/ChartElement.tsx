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
};

export default function App({
  id,
  state,
  label, // optional subtext
  position, // todo
  innerRef,
  style,
}: ChartElementProps) {
  return (
    <Grid item style={styles.box}>
      <View style={[styles.element, style]} ref={innerRef}>
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
    padding: 30,
    backgroundColor: '#b58df1',
  },
  header: {
    fontWeight: '500',
    fontSize: 22,
    minWidth: 110,
  },
  subtext: {
    fontWeight: '300',
    fontSize: 14,
  },
});
