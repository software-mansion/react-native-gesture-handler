import { renderHook } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';
import React from 'react';

import { useJSResponderHandler } from '../v3/hooks/useJSResponderHandler';
import {
  JSResponderContext,
  type JSResponderContextValue,
} from '../v3/scrollViewInterop';
import { type Gesture, SingleGestureName } from '../v3/types';

jest.mock('../handlers/gestures/reanimatedWrapper', () => ({
  Reanimated: {
    isSharedValue: (value: unknown) =>
      typeof value === 'object' &&
      value !== null &&
      '__isFakeSharedValue' in value,
  },
}));

describe('useJSResponderHandler', () => {
  test('reads a SharedValue `enabled` when the touch starts', () => {
    const enabled = { __isFakeSharedValue: true, value: true };
    const gesture = {
      type: SingleGestureName.Tap,
      config: { enabled },
    } as unknown as Gesture<unknown, unknown, unknown>;
    const context: JSResponderContextValue = {
      isRNGHResponderEvent: { current: false },
      keyboardShouldPersistTaps: 'handled',
    };
    const wrapper = ({ children }: PropsWithChildren) => (
      <JSResponderContext value={context}>{children}</JSResponderContext>
    );

    const { result } = renderHook(() => useJSResponderHandler(gesture), {
      wrapper,
    });

    // No re-render between the flips, like a SharedValue changed on the UI thread
    const touch = () => {
      context.isRNGHResponderEvent.current = false;
      result.current.handleStartShouldSetResponder();
      return context.isRNGHResponderEvent.current;
    };

    expect(touch()).toBe(true);
    enabled.value = false;
    expect(touch()).toBe(false);
    enabled.value = true;
    expect(touch()).toBe(true);
  });
});
