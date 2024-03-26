import { Grid } from '@mui/material';
import React, { LegacyRef } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle, Text } from 'react-native';

type ChartElementProps = {
  id: number;
  label: string;
  subtext?: string; // optional subtext
  position?: null; // todo
  innerRef?: LegacyRef<View>;
  style?: StyleProp<ViewStyle>;
  isVisible?: boolean;
  isHeader?: boolean;
};

export default function App({
  label,
  subtext, // optional subtext
  innerRef,
  style,
  isVisible,
  isHeader,
}: ChartElementProps) {
  return (
    <Grid item style={isHeader ? styles.headerBox : styles.box} xs={3}>
      <View
        style={[
          isHeader ? null : styles.element,
          isVisible ? null : styles.hidden,
          style,
        ]}
        ref={innerRef}>
        <Text style={isHeader ? styles.headerText : styles.label}>{label}</Text>
      </View>
      <Text style={styles.subtext}>{subtext}</Text>
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
  headerBox: {
    flex: 1,
    flexDirection: 'column',
    textAlign: 'center',
    maxWidth: 800,
  },
  element: {
    padding: 16,
    backgroundColor: '#b58df1',
  },
  headerText: {
    fontSize: 28,
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
