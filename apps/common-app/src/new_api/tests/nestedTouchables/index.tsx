import React, { useCallback, useRef, useState } from 'react';
import type { ViewStyle } from 'react-native';
import { StyleSheet, Text, View } from 'react-native';
import {
  GestureDetector,
  Touchable,
  useTapGesture,
} from 'react-native-gesture-handler';
import type { AnimatedStyle } from 'react-native-reanimated';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { COLORS, useIndexedLogger } from '../../../common';

type LevelEvent = { name: string; count: number };

function useLevel(token: string, log: (message: string) => void) {
  const [lastEvent, setLastEvent] = useState<LevelEvent | null>(null);
  const counts = useRef<Record<string, number>>({});
  const flash = useSharedValue(0);

  const updateLastEvent = useCallback((name: string) => {
    const count = (counts.current[name] ?? 0) + 1;
    counts.current[name] = count;
    setLastEvent({ name, count });
  }, []);

  const report = useCallback(
    (name: string) => {
      'worklet';
      log(`${token} ${name}`);
      // Snap to the highlight color, then fade back to the resting one.
      flash.value = 1;
      flash.value = withTiming(0, { duration: 700 });
      scheduleOnRN(updateLastEvent, name);
    },
    [flash, log, token, updateLastEvent]
  );

  const flashStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      flash.value,
      [0, 1],
      [COLORS.offWhite, COLORS.PURPLE]
    ),
  }));

  return { report, lastEvent, flashStyle };
}

type LevelBandProps = {
  testID: string;
  label: string;
  event: LevelEvent | null;
  flashStyle: AnimatedStyle<ViewStyle>;
};

// Keep the level tokens (L1..L4) out of on-screen text. The screen stays in the
// native tree behind the console modal, and nested-touchables-test.yaml asserts
// those tokens are hidden while the modal covers it.
function LevelBand({ testID, label, event, flashStyle }: LevelBandProps) {
  return (
    <Animated.View testID={testID} style={[styles.band, flashStyle]}>
      <Text style={styles.bandLabel}>{label}</Text>
      <Text style={styles.bandEvent}>
        {event ? `${event.name} x${event.count}` : 'no events'}
      </Text>
    </Animated.View>
  );
}

export default function NestedTouchablesExample() {
  const log = useIndexedLogger();

  const level1 = useLevel('L1', log);
  const level2 = useLevel('L2', log);
  const level3 = useLevel('L3', log);
  const level4 = useLevel('L4', log);

  const { report: reportLevel1 } = level1;
  const { report: reportLevel3 } = level3;

  const level1Tap = useTapGesture({
    onActivate: () => reportLevel1('onActivate'),
  });

  const level3Tap = useTapGesture({
    onActivate: () => reportLevel3('onActivate'),
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nested gestures & touchables</Text>
      <Text style={styles.hint}>
        Tap the band of a level. Only that band should flash and update.
      </Text>

      <GestureDetector gesture={level1Tap}>
        <View style={[styles.level, styles.level1]}>
          <LevelBand
            testID="level-1"
            label="1 - tap gesture"
            event={level1.lastEvent}
            flashStyle={level1.flashStyle}
          />

          <Touchable
            style={[styles.level, styles.level2]}
            activeUnderlayOpacity={0.3}
            onPressIn={() => level2.report('onPressIn')}
            onPressOut={() => level2.report('onPressOut')}
            onPress={() => level2.report('onPress')}>
            <LevelBand
              testID="level-2"
              label="2 - touchable"
              event={level2.lastEvent}
              flashStyle={level2.flashStyle}
            />

            <GestureDetector gesture={level3Tap}>
              <View style={[styles.level, styles.level3]}>
                <LevelBand
                  testID="level-3"
                  label="3 - tap gesture"
                  event={level3.lastEvent}
                  flashStyle={level3.flashStyle}
                />

                <Touchable
                  style={[styles.level, styles.level4]}
                  activeUnderlayOpacity={0.3}
                  onPressIn={() => level4.report('onPressIn')}
                  onPressOut={() => level4.report('onPressOut')}
                  onPress={() => level4.report('onPress')}>
                  <LevelBand
                    testID="level-4"
                    label="4 - touchable"
                    event={level4.lastEvent}
                    flashStyle={level4.flashStyle}
                  />
                </Touchable>
              </View>
            </GestureDetector>
          </Touchable>
        </View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
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
  level: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderRadius: 12,
    padding: 8,
    gap: 8,
  },
  level1: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: COLORS.KINDA_YELLOW,
  },
  level2: {
    alignSelf: 'stretch',
    backgroundColor: COLORS.YELLOW,
  },
  level3: {
    alignSelf: 'stretch',
    backgroundColor: COLORS.KINDA_GREEN,
  },
  level4: {
    alignSelf: 'stretch',
    backgroundColor: COLORS.KINDA_BLUE,
  },
  band: {
    alignSelf: 'stretch',
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  bandLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.NAVY,
  },
  bandEvent: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.NAVY,
  },
});
