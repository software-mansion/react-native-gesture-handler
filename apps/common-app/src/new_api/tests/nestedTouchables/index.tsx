import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  GestureDetector,
  Touchable,
  useTapGesture,
} from 'react-native-gesture-handler';

import { COLORS } from '../../../common';

export default function NestedTouchablesExample() {
  const [log, setLog] = useState<string[]>([]);

  const pushLog = (message: string) => {
    console.log(message);
    setLog((prev) =>
      [...prev, `[${new Date().toLocaleTimeString()}] ${message}`].slice(-6)
    );
  };

  const outerTap = useTapGesture({
    runOnJS: true,
    onActivate: () => pushLog('outer tap gesture'),
    testID: 'outer-tap',
  });

  const innerTap = useTapGesture({
    runOnJS: true,
    onActivate: () => pushLog('inner tap gesture'),
    testID: 'inner-tap',
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nested gestures & touchables</Text>
      <Text style={styles.hint}>
        Tap each colored layer. Every level fires its own handler.
      </Text>

      <GestureDetector gesture={outerTap}>
        <View style={[styles.layer, styles.outerLayer]}>
          <Text style={styles.layerLabel}>Outer tap gesture</Text>

          <Touchable
            style={[styles.layer, styles.outerTouchable]}
            testID="outer-touchable"
            activeUnderlayOpacity={0.3}
            onPressIn={() => pushLog('outer press in')}
            onPressOut={() => pushLog('outer press out')}
            onLongPress={() => pushLog('outer long press')}
            onPress={() => pushLog('outer Touchable')}>
            <Text style={styles.layerLabel}>Outer Touchable</Text>

            <GestureDetector gesture={innerTap}>
              <View style={[styles.layer, styles.innerLayer]}>
                <Text style={styles.layerLabel}>Inner tap gesture</Text>

                <Touchable
                  style={[styles.layer, styles.innerTouchable]}
                  testID="inner-touchable"
                  activeUnderlayOpacity={0.3}
                  onPressIn={() => pushLog('inner press in')}
                  onPressOut={() => pushLog('inner press out')}
                  onLongPress={() => pushLog('inner long press')}
                  onPress={() => pushLog('inner Touchable')}>
                  <Text style={styles.layerLabel}>Inner Touchable</Text>
                </Touchable>
              </View>
            </GestureDetector>
          </Touchable>
        </View>
      </GestureDetector>

      <View style={styles.logBox}>
        <Text style={styles.logTitle}>Event log</Text>
        {Array.from({ length: 6 }).map((_, index) => (
          <Text key={index} style={styles.logEntry}>
            {log[index] ?? ' '}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  hint: {
    textAlign: 'center',
    opacity: 0.6,
    fontSize: 14,
  },
  layer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  outerLayer: {
    width: 300,
    backgroundColor: COLORS.KINDA_YELLOW,
  },
  outerTouchable: {
    width: 260,
    backgroundColor: COLORS.YELLOW,
  },
  innerLayer: {
    width: 220,
    backgroundColor: COLORS.KINDA_GREEN,
  },
  innerTouchable: {
    width: 180,
    backgroundColor: COLORS.KINDA_BLUE,
  },
  layerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.NAVY,
  },
  logBox: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    backgroundColor: COLORS.offWhite,
    gap: 4,
  },
  logTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  logEntry: {
    fontSize: 12,
    fontFamily: 'Menlo',
  },
});
