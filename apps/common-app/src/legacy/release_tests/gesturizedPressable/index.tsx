import React, { ReactNode } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import { BACKGROUND_COLOR } from './testingBase';
import { HitSlopExample } from './hitSlopExample';
import { RippleExample } from './androidRippleExample';
import { FunctionalStyleExample } from './functionalStylesExample';
import { DelayedPressExample } from './delayedPressExample';
import { DelayHoverExample } from './hoverDelayExample';

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
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {platform && <Text style={styles.code}>{platform}</Text>}
      </View>
      {comment && <Text style={styles.comment}>{comment}</Text>}
    </View>
    <View style={styles.testSandbox}>{children}</View>
    <View style={styles.separator} />
  </View>
);

export default function Example() {
  return (
    <ScrollView>
      <TestingEntry
        title="Hit Slop & Press Retention Offset"
        comment="Parameters which increase the area which is clickable, and which maintains touch down gesture respectively.">
        <HitSlopExample />
      </TestingEntry>
      <TestingEntry
        title="Ripple"
        platform="Android"
        comment="Ripple effect which is only available on android">
        <RippleExample />
      </TestingEntry>
      <TestingEntry
        title="Functional styling"
        comment="Styles that are set with a function">
        <FunctionalStyleExample />
      </TestingEntry>
      <TestingEntry
        title="Delays on press"
        comment="Duration between press down and onPressIn">
        <DelayedPressExample />
      </TestingEntry>
      <TestingEntry
        title="Delay hoverIn/Out"
        comment="Delay set to hover in and out"
        platform="web">
        <DelayHoverExample />
      </TestingEntry>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: BACKGROUND_COLOR,
    justifyContent: 'center',
  },
  data: {
    flex: 1,
    alignSelf: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 12,
    marginTop: 15,
  },
  header: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center',
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '400',
  },
  code: {
    fontSize: 16,
    fontWeight: '400',
    padding: 5,
    borderRadius: 5,

    color: '#37474f',
    backgroundColor: '#bbc',
    fontFamily: 'monospace',
    fontVariant: ['tabular-nums'],
  },
  comment: {
    alignSelf: 'flex-start',
    textAlign: 'center',
    margin: 15,
    marginTop: 0,
    marginBottom: 5,
    color: '#555',
  },
  testSandbox: {
    marginTop: 5,
    display: 'flex',
    alignItems: 'center',
  },
  separator: {
    borderWidth: 0.6,
    borderStyle: 'dashed',
  },
});
