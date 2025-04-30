import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import TestingBase from './testingBase';

const HIT_SLOP = 40;
const PRESS_RETENTION_OFFSET = HIT_SLOP;

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

  return (
    <View style={styles.retentionIndicator}>
      <View style={styles.slopIndicator}>
        <View style={styles.container}>
          <TestingBase
            style={styles.pressable}
            hitSlop={HIT_SLOP}
            pressRetentionOffset={PRESS_RETENTION_OFFSET}
            onPressIn={() => pressIn()}
            onPressOut={() => pressOut()}
            onPress={() => press()}
            onHoverIn={() => hoverIn()}
            onHoverOut={() => hoverOut()}
            onLongPress={() => longPress()}
          />
        </View>
        <Text style={styles.text}>Hit Slop</Text>
      </View>
      <Text style={styles.text}>Retention Offset</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 40,
  },
  pressable: {
    backgroundColor: 'mediumpurple',
    width: 100,
    height: 100,
  },
  text: {
    alignSelf: 'flex-end',
    marginBottom: 4,
    marginRight: 6,
    marginTop: 12,
  },
  slopIndicator: {
    display: 'flex',
    alignItems: 'center',
    width: 100 + HIT_SLOP * 2,
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  retentionIndicator: {
    display: 'flex',
    alignItems: 'center',
    width: 180 + PRESS_RETENTION_OFFSET * 2,
    borderRightWidth: StyleSheet.hairlineWidth,
    margin: 20,
  },
});
