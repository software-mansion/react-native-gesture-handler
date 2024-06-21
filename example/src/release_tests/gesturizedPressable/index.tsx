import React, { ReactNode } from 'react';
import { HitSlopExample } from './hitSlop';
import { Text, View, StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

type TestingEntryProps = {
  title: string;
  children: ReactNode;
};
const TestingEntry = ({ children, title }: TestingEntryProps) => (
  <View style={styles.container}>
    <Text style={styles.title}>{title}</Text>
    {children}
    <View style={styles.separator} />
  </View>
);

export default function Example() {
  return (
    <ScrollView style={{ flex: 1, height: '100%' }}>
      <TestingEntry title="Hit Slop">
        <HitSlopExample />
      </TestingEntry>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5FCFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    margin: 12,
    fontWeight: '400',
    alignSelf: 'flex-start',
  },
  separator: {
    width: '90%',
    // ios bug - different border styling doesn't work on just 1 side
    borderWidth: 0.6,
    borderStyle: 'dashed',
    margin: 12,
  },
});
