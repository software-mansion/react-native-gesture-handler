import React, { ReactNode } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import { HitSlopExample } from './hitSlop';
import { RippleExample } from './androidRipple';
import { FunctionalStyleExample } from './functionalStyles';
import { DelayedPressExample } from './delayedPress';
import { DelayHoverExample } from './hoverDelay';
import { commonStyles } from '../../../common';

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
  <View style={commonStyles.subcontainer}>
    <View style={styles.data}>
      <View style={commonStyles.centered}>
        <Text style={commonStyles.header}>{title}</Text>
        {platform && <Text style={styles.code}>{platform}</Text>}
      </View>
      {comment && <Text style={commonStyles.instructions}>{comment}</Text>}
    </View>
    <View style={commonStyles.centerView}>{children}</View>
  </View>
);

export default function Example() {
  return (
    <ScrollView style={{ paddingTop: 50 }}>
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
  data: {
    marginBottom: 10,
  },
  code: {
    fontSize: 16,
    fontWeight: '400',
    padding: 5,
    borderRadius: 5,
    marginBottom: 10,
    color: '#37474f',
    backgroundColor: '#bbc',
    fontFamily: 'monospace',
    fontVariant: ['tabular-nums'],
  },
});
