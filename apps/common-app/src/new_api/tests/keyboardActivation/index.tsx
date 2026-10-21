import React, { useRef } from 'react';
import {
  Pressable as ReactNativePressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  GestureDetector,
  GestureStateManager,
  LegacyPressable,
  PointerType,
  Pressable,
  RawButton,
  RectButton,
  ScrollView,
  TextInput,
  Touchable,
  useLongPressGesture,
} from 'react-native-gesture-handler';

import { COLORS, useIndexedLogger } from '../../../common';

type Log = (message: string) => void;

type Position = { absoluteX: number; absoluteY: number };

const pressHandlers = (log: Log, token: string) => ({
  onPressIn: () => log(`${token} onPressIn`),
  onPressOut: () => log(`${token} onPressOut`),
  onPress: () => log(`${token} onPress`),
});

// The first press is a tap; the next one, a key's, has to land where the tap did.
function useTapComparison(log: Log) {
  const tap = useRef<Position | null>(null);

  return ({ absoluteX, absoluteY }: Position) => {
    if (tap.current === null) {
      tap.current = { absoluteX, absoluteY };
      log('[scaled] tap');
      return;
    }

    const offsetX = Math.round(absoluteX - tap.current.absoluteX);
    const offsetY = Math.round(absoluteY - tap.current.absoluteY);
    tap.current = null;
    log(
      Math.abs(offsetX) <= 1 && Math.abs(offsetY) <= 1
        ? '[scaled] key press lands on the tap'
        : `[scaled] key press misses the tap by ${offsetX}, ${offsetY}`
    );
  };
}

// Keep the bracketed tokens out of on-screen text: the screen stays in the
// native tree behind the console modal, and keyboard-activation-test.yaml
// asserts those tokens are hidden while the modal covers it.
export default function KeyboardActivationExample() {
  const log = useIndexedLogger();
  const compareWithTap = useTapComparison(log);
  const touchActivatedLongPress = useLongPressGesture({
    onTouchesDown: (event) => {
      'worklet';
      GestureStateManager.activate(event.handlerTag);
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.hint}>
        Focus a control with Tab, then press Enter or Space.
      </Text>

      <View style={styles.row}>
        <Pressable
          testID="pressable-outer"
          style={styles.outer}
          {...pressHandlers(log, '[pressable outer]')}>
          <Pressable
            testID="pressable-inner"
            style={styles.inner}
            {...pressHandlers(log, '[pressable inner]')}
          />
        </Pressable>

        {/* A relation prop routes Pressable to its state-machine engine. */}
        <Pressable
          testID="stateful-outer"
          simultaneousWith={[]}
          style={styles.outer}
          {...pressHandlers(log, '[stateful outer]')}>
          <Pressable
            testID="stateful-inner"
            simultaneousWith={[]}
            style={styles.inner}
            {...pressHandlers(log, '[stateful inner]')}
          />
        </Pressable>

        <LegacyPressable
          testID="legacy-outer"
          style={styles.outer}
          {...pressHandlers(log, '[legacy outer]')}>
          <LegacyPressable
            testID="legacy-inner"
            style={styles.inner}
            {...pressHandlers(log, '[legacy inner]')}
          />
        </LegacyPressable>
      </View>

      <RectButton
        testID="rect-button"
        style={styles.button}
        onBegin={(event) =>
          log(
            `[rect button] onBegin ${PointerType[event.pointerType]} with ${event.numberOfPointers} pointers`
          )
        }
        onPress={() => log('[rect button] onPress')}
      />

      <View style={styles.scaled}>
        <Touchable
          testID="scaled-touchable"
          style={styles.wide}
          onPress={compareWithTap}
        />
      </View>

      {/* Its touch activates it from a UI-thread onTouchesDown, before the button reads that touch. */}
      <RawButton
        testID="touch-activated-button"
        disableReanimated={false}
        style={styles.touchActivatedButton}
        onTouchesDown={(event) => {
          'worklet';
          GestureStateManager.activate(event.handlerTag);
        }}
        onActivate={(event) => {
          'worklet';
          log(
            `[touch activated button] onActivate ${PointerType[event.pointerType]} with ${event.numberOfPointers} pointers`
          );
        }}
      />

      {/* A tap here while the input holds the soft keyboard only dismisses it; a key press is no such tap. */}
      <ScrollView
        style={styles.typing}
        contentContainerStyle={styles.typingContent}
        keyboardShouldPersistTaps="never">
        <TextInput
          testID="typing-input"
          placeholder="Type, then Tab"
          style={styles.input}
        />
        <Pressable
          testID="typing-pressable"
          style={styles.typingButton}
          {...pressHandlers(log, '[typing pressable]')}
        />
      </ScrollView>

      <Pressable
        testID="disabled-pressable"
        disabled
        style={styles.disabledButton}
        {...pressHandlers(log, '[disabled pressable]')}
      />

      {/* A gesture its own touch activates takes that touch from React Native's Pressable, the first touch after mount included. */}
      <GestureDetector gesture={touchActivatedLongPress}>
        <ReactNativePressable
          testID="react-native-pressable"
          style={styles.reactNativeButton}
          {...pressHandlers(log, '[react native pressable]')}
        />
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
  hint: {
    textAlign: 'center',
    opacity: 0.6,
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  outer: {
    width: 88,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: COLORS.KINDA_BLUE,
  },
  inner: {
    width: 48,
    height: 40,
    borderRadius: 8,
    backgroundColor: COLORS.NAVY,
  },
  button: {
    width: 200,
    height: 48,
    backgroundColor: COLORS.KINDA_GREEN,
  },
  scaled: {
    transform: [{ scale: 0.5 }],
  },
  wide: {
    width: 240,
    height: 56,
    borderRadius: 12,
    backgroundColor: COLORS.YELLOW,
  },
  touchActivatedButton: {
    width: 200,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.KINDA_GREEN,
  },
  typing: {
    flexGrow: 0,
    alignSelf: 'stretch',
  },
  typingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    height: 40,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: COLORS.GRAY,
  },
  typingButton: {
    width: 80,
    height: 40,
    borderRadius: 8,
    backgroundColor: COLORS.NAVY,
  },
  disabledButton: {
    width: 200,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.GRAY,
  },
  reactNativeButton: {
    width: 200,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.NAVY,
  },
});
