import React, { ReactNode } from 'react';
import { HitSlopExample } from './hitSlop';
import { RippleExample } from './androidRipple';
import { Text, View, StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { BG_COLOR } from './testingBase';
import { FunctionalStyleExample } from './functionalStyles';

type TestingEntryProps = {
  title: string;
  platform?: string;
  comment?: string;
  children: ReactNode;
};
const TestingEntry = ({
  children,
  title,
  platform,
  comment,
}: TestingEntryProps) => (
  <View style={styles.container}>
    <View style={styles.data}>
      <Text style={styles.title}>{title}</Text>
      {platform && <Text style={styles.code}>{platform}</Text>}
      {comment && <Text style={styles.code}>{comment}</Text>}
    </View>
    {children}
    <View style={styles.separator} />
  </View>
);

export default function Example() {
  return (
    <ScrollView style={styles.scrollable}>
      <TestingEntry title="Hit Slop">
        <HitSlopExample />
      </TestingEntry>
      <TestingEntry title="Ripple" platform="Android">
        <RippleExample />
      </TestingEntry>
      <TestingEntry title="Functional styling">
        <FunctionalStyleExample />
      </TestingEntry>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: BG_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  data: {
    alignSelf: 'flex-start',
    flex: 1,
    flexDirection: 'row',
  },
  title: {
    fontSize: 28,
    margin: 12,
    fontWeight: '400',
  },
  code: {
    fontSize: 24,
    fontWeight: '400',
    padding: 5,
    borderRadius: 5,
    height: 44,
    margin: 'auto',

    color: '#37474f',
    backgroundColor: '#90a4ae',
    fontFamily: 'monospace',
  },
  comment: {},
  scrollable: {},
  separator: {
    width: '90%',
    // ios bug - different border styling doesn't work on just 1 side
    borderWidth: 0.6,
    borderStyle: 'dashed',
    margin: 12,
  },
});
