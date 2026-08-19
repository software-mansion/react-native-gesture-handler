import { render, screen } from '@testing-library/react-native';
import React from 'react';
import type { Platform as PlatformModule } from 'react-native';
import { Text } from 'react-native';

import GestureHandlerRootView from '../components/GestureHandlerRootView';
import { Pressable } from '../v3/components';

// The Touchable engine reads `Platform.OS` once, at import time, to decide
// whether the native ripple applies — so the platform has to be swapped before
// the component module loads.
jest.mock('react-native/Libraries/Utilities/Platform', () => {
  const actual = jest.requireActual<{ default: typeof PlatformModule }>(
    'react-native/Libraries/Utilities/Platform'
  ).default;
  return {
    __esModule: true,
    default: {
      ...actual,
      OS: 'android',
      select: (spec: Record<string, unknown>) =>
        'android' in spec ? spec.android : (spec.native ?? spec.default),
    },
  };
});

// Both engines have to forward the whole `android_ripple` config to the button —
// dropping `borderless`/`foreground` made the two flags silently do nothing on
// the engine that omitted them.
const RIPPLE = {
  color: 'red',
  radius: 20,
  borderless: true,
  foreground: true,
} as const;

const expectRippleOnButton = () => {
  const button = screen.getByTestId('pressable');

  expect(button.props.rippleColor).toBe(RIPPLE.color);
  expect(button.props.rippleRadius).toBe(RIPPLE.radius);
  expect(button.props.borderless).toBe(true);
  expect(button.props.foreground).toBe(true);
};

test('StatefulPressable forwards the whole android_ripple config', () => {
  render(
    <GestureHandlerRootView>
      {/* A relation prop routes `Pressable` to the `StatefulPressable` engine. */}
      <Pressable
        testID="pressable"
        simultaneousWith={[]}
        android_ripple={RIPPLE}>
        <Text>Press Me</Text>
      </Pressable>
    </GestureHandlerRootView>
  );

  expectRippleOnButton();
});

test('PressableWithTouchable forwards the whole android_ripple config', () => {
  render(
    <GestureHandlerRootView>
      <Pressable testID="pressable" android_ripple={RIPPLE}>
        <Text>Press Me</Text>
      </Pressable>
    </GestureHandlerRootView>
  );

  expectRippleOnButton();
});
