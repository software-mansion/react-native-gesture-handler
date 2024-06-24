import React, { ReactNode } from 'react';
import { HitSlopExample } from './hitSlop';
import { RippleExample } from './androidRipple';
import { Text, View, StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { BG_COLOR } from './testingBase';
import { FunctionalStyleExample } from './functionalStyles';
import { DelayedPressExample } from './delayedPress';

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
    </View>
    {comment && <Text style={styles.comment}>{comment}</Text>}
    {children}
    <View style={styles.separator} />
  </View>
);

export default function Example() {
  return (
    <ScrollView style={styles.scrollable}>
      <TestingEntry
        title="Hit Slop"
        comment="Increases area which is clickable, and which maintains touch down gesture.">
        <HitSlopExample />
      </TestingEntry>
      <TestingEntry title="Ripple" platform="Android">
        <RippleExample />
      </TestingEntry>
      <TestingEntry
        title="Functional styling"
        comment="Styles that are set with a function">
        <FunctionalStyleExample />
      </TestingEntry>
      <TestingEntry
        title="Delays on press callbacks"
        comment="Duration between press down and onPressIn">
        <DelayedPressExample />
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
    flex: 1,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  title: {
    fontSize: 28,
    marginLeft: 12,
    marginBottom: 5,
    fontWeight: '400',
  },
  code: {
    fontSize: 18,
    fontWeight: '400',
    padding: 5,
    borderRadius: 5,
    height: 34,
    margin: 'auto',

    color: '#37474f',
    backgroundColor: '#bbc',
    fontFamily: 'monospace',
    fontVariant: ['tabular-nums'],
  },
  comment: {
    alignSelf: 'flex-start',
    marginLeft: 20,
    marginTop: 0,
    marginBottom: 5,
    color: '#555',
  },
  scrollable: {},
  separator: {
    width: '90%',
    // ios bug - different border styling doesn't work on just 1 side
    borderWidth: 0.6,
    borderStyle: 'dashed',
    margin: 12,
  },
});
