import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Pressable } from 'react-native-gesture-handler';

const BACKGROUND_COLOR = '#F5FCFF';

const HIT_SLOP = 60;
const PRESS_RETENTION_OFFSET = HIT_SLOP;
const BOX_SIZE = 100;

export default function Example() {
  return (
    <View style={styles.container}>
      <View style={styles.retentionIndicator}>
        <View style={styles.slopIndicator}>
          <View style={styles.container}>
            <Pressable
              style={styles.pressable}
              hitSlop={HIT_SLOP}
              // pressRetentionOffset={PRESS_RETENTION_OFFSET}
            >
              <Text style={styles.text}>Pressable</Text>
            </Pressable>
          </View>
          <Text style={styles.text}>Hit Slop</Text>
        </View>
        <Text style={styles.text}>Retention Offset</Text>
      </View>
      <Pressable
        style={[styles.pressable]}
        android_ripple={{
          color: 'green',
          borderless: false,
          foreground: false,
        }}>
        <Text style={styles.text}>Function indicator</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 450,
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 60,
  },
  pressable: {
    backgroundColor: 'mediumpurple',
    borderWidth: StyleSheet.hairlineWidth,
    width: BOX_SIZE,
    height: BOX_SIZE,
    justifyContent: 'center',
  },
  text: {
    color: BACKGROUND_COLOR,
    textAlign: 'center',
  },
  slopIndicator: {
    backgroundColor: 'pink',
    width: BOX_SIZE + HIT_SLOP * 2,
    height: BOX_SIZE + HIT_SLOP,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retentionIndicator: {
    backgroundColor: 'plum',
    alignSelf: 'center',
    alignItems: 'center',
    width: BOX_SIZE + HIT_SLOP * 2 + PRESS_RETENTION_OFFSET * 2,
    height: BOX_SIZE + HIT_SLOP + PRESS_RETENTION_OFFSET,
  },
});
