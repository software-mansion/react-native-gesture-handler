import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import TestingBase, { BG_COLOR } from './testingBase';

export function HitSlopExample() {
  const pressIn = () => {
    console.log('Pressable pressed in');
  };

  const pressOut = () => {
    console.log('Pressable pressed out');
  };

  const press = () => {
    console.log('Pressable pressed');
  };

  const hoverIn = () => {
    console.log('Hovered in');
  };

  const hoverOut = () => {
    console.log('Hovered out');
  };

  const longPress = () => {
    console.log('Long pressed');
  };

  const hitSlop = 40;
  const pressRetentionOffset = 40;

  return (
    <>
      <View style={styles.slopIndicator}>
        <Text>Hit Slop</Text>
      </View>
      <View style={styles.retentionIndicator}>
        <Text>Retention Offset</Text>
      </View>
      <View style={styles.container}>
        <TestingBase
          style={styles.pressable}
          hitSlop={hitSlop}
          pressRetentionOffset={pressRetentionOffset}
          onPressIn={() => pressIn()}
          onPressOut={() => pressOut()}
          onPress={() => press()}
          onHoverIn={() => hoverIn()}
          onHoverOut={() => hoverOut()}
          onLongPress={() => longPress()}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
    height: 280,
    marginBottom: 40,
  },
  pressable: {
    backgroundColor: 'mediumpurple',
    width: 100,
    height: 100,
  },
  textWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: BG_COLOR,
  },
  slopIndicator: {
    position: 'absolute',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    top: 55,
    height: 275,
    width: 180,
    paddingRight: 4,
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  retentionIndicator: {
    position: 'absolute',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    top: 55,
    height: 300,
    width: 260,
    paddingRight: 4,
    borderRightWidth: StyleSheet.hairlineWidth,
  },
});
