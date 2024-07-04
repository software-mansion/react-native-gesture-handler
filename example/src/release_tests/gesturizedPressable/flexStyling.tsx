import React from 'react';
import { Pressable as LegacyPressable, StyleSheet, View } from 'react-native';
import {
  Pressable as GesturizedPressable,
  ScrollView,
} from 'react-native-gesture-handler';
import { LoremIpsum } from '../../common';

export default function FlexExample() {
  return (
    <ScrollView>
      <View style={styles.container}>
        <GesturizedNesting />
        <LegacyNesting />
      </View>
      <LoremIpsum words={40} />
    </ScrollView>
  );
}

function GesturizedNesting() {
  return (
    <GesturizedPressable style={styles.outer}>
      <GesturizedPressable style={styles.inner} />
    </GesturizedPressable>
  );
}

function LegacyNesting() {
  return (
    <LegacyPressable style={styles.outer}>
      <LegacyPressable style={styles.inner} />
    </LegacyPressable>
  );
}

const styles = StyleSheet.create({
  text: {
    padding: 10,
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  inner: {
    backgroundColor: 'green',
    width: 50,
    height: 50,
  },
  outer: {
    backgroundColor: 'red',
    width: 150,
    height: 150,

    alignItems: 'center',
    justifyContent: 'space-evenly',
    margin: 25,
  },
});
