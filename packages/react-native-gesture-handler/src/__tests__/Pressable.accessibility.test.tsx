import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Platform, Text } from 'react-native';

import GestureHandlerRootView from '../components/GestureHandlerRootView';
import LegacyPressable from '../components/Pressable/Pressable';
import type {
  PressableEvent,
  PressableProps,
} from '../components/Pressable/PressableProps';
import Pressable from '../v3/components/Pressable';

jest.unmock('../components/Pressable/Pressable');

type TestPressableProps = Omit<
  PressableProps,
  'block' | 'requireToFail' | 'simultaneousWith'
>;
type AccessibilityActionHandler = NonNullable<
  TestPressableProps['onAccessibilityAction']
>;

const originalPlatformOS = Platform.OS;
const implementations = [
  ['Pressable', Pressable as React.ComponentType<TestPressableProps>],
  [
    'LegacyPressable',
    LegacyPressable as React.ComponentType<TestPressableProps>,
  ],
] as const;

const setPlatform = (platform: typeof Platform.OS) => {
  Object.defineProperty(Platform, 'OS', {
    configurable: true,
    value: platform,
  });
};

beforeEach(() => {
  setPlatform('android');
});

afterEach(() => {
  setPlatform(originalPlatformOS);
});

function renderPressable(
  Component: React.ComponentType<TestPressableProps>,
  props: TestPressableProps,
  layout = { x: 0, y: 0, width: 100, height: 40 }
) {
  const result = render(
    <GestureHandlerRootView>
      <Component testID="pressable" {...props}>
        <Text>Press me</Text>
      </Component>
    </GestureHandlerRootView>
  );
  const pressable = result.getByTestId('pressable');

  fireEvent(pressable, 'layout', {
    nativeEvent: { layout },
  });

  return { ...result, pressable };
}

describe.each(implementations)(
  '%s accessibility actions',
  (_name, Component) => {
    test('routes activate through the press lifecycle on Android', () => {
      const calls: string[] = [];

      const { pressable } = renderPressable(Component, {
        onPressIn: () => calls.push('in'),
        onPressOut: () => calls.push('out'),
        onPress: () => calls.push('press'),
      });

      fireEvent(pressable, 'accessibilityAction', {
        nativeEvent: { actionName: 'activate' },
      });

      expect(calls).toEqual(['in', 'out', 'press']);
    });

    test('uses separate layout-local synthetic events for press in and out', () => {
      const onPressIn = jest.fn<void, [PressableEvent]>();
      const onPressOut = jest.fn<void, [PressableEvent]>();

      const { pressable } = renderPressable(
        Component,
        {
          onPressIn,
          onPressOut,
          onPress: jest.fn(),
        },
        { x: 10, y: 20, width: 100, height: 40 }
      );

      fireEvent(pressable, 'accessibilityAction', {
        nativeEvent: { actionName: 'activate' },
      });

      const pressInEvent = onPressIn.mock.calls[0][0];
      const pressOutEvent = onPressOut.mock.calls[0][0];

      expect(pressInEvent.nativeEvent).toEqual(
        expect.objectContaining({
          locationX: 50,
          locationY: 20,
          pageX: 60,
          pageY: 40,
        })
      );
      expect(pressOutEvent.nativeEvent.timestamp).toBeGreaterThan(
        pressInEvent.nativeEvent.timestamp
      );
    });

    test('routes longpress accessibility action to onLongPress on Android', () => {
      const onLongPress = jest.fn();
      const onPress = jest.fn();

      const { pressable } = renderPressable(Component, {
        onLongPress,
        onPress,
      });

      fireEvent(pressable, 'accessibilityAction', {
        nativeEvent: { actionName: 'longpress' },
      });

      expect(onLongPress).toHaveBeenCalledTimes(1);
      expect(onPress).not.toHaveBeenCalled();
    });

    test('adds Android press accessibility actions without dropping user actions', () => {
      const { pressable } = renderPressable(Component, {
        accessibilityActions: [{ name: 'magic', label: 'Magic' }],
        onLongPress: jest.fn(),
        onPress: jest.fn(),
      });

      expect(pressable.props.accessibilityActions).toEqual([
        { name: 'magic', label: 'Magic' },
        { name: 'activate' },
        { name: 'longpress' },
      ]);
    });

    test('calls user accessibility action handler alongside default press handling', () => {
      const onAccessibilityAction = jest.fn();
      const onPress = jest.fn();

      const { pressable } = renderPressable(Component, {
        onAccessibilityAction,
        onPress,
      });

      fireEvent(pressable, 'accessibilityAction', {
        nativeEvent: { actionName: 'activate' },
      });

      expect(onPress).toHaveBeenCalledTimes(1);
      expect(onAccessibilityAction).toHaveBeenCalledTimes(1);
    });

    test('does not duplicate user-handled activate actions', () => {
      const onPress = jest.fn();
      const handleAccessibilityAction: AccessibilityActionHandler = (event) => {
        if (event.nativeEvent.actionName === 'activate') {
          onPress(event);
        }
      };
      const onAccessibilityAction = jest.fn(handleAccessibilityAction);

      const { pressable } = renderPressable(Component, {
        accessibilityActions: [{ name: 'activate' }],
        onAccessibilityAction,
        onPress,
      });

      fireEvent(pressable, 'accessibilityAction', {
        nativeEvent: { actionName: 'activate' },
      });

      expect(onPress).toHaveBeenCalledTimes(1);
      expect(onAccessibilityAction).toHaveBeenCalledTimes(1);
    });

    test('does not add or handle press accessibility actions when disabled', () => {
      const onPress = jest.fn();

      const { pressable } = renderPressable(Component, {
        accessibilityActions: [{ name: 'magic', label: 'Magic' }],
        disabled: true,
        onPress,
      });

      expect(pressable.props.accessibilityActions).toEqual([
        { name: 'magic', label: 'Magic' },
      ]);
      expect(pressable.props.onAccessibilityAction).toBeUndefined();

      fireEvent(pressable, 'accessibilityAction', {
        nativeEvent: { actionName: 'activate' },
      });

      expect(onPress).not.toHaveBeenCalled();
    });

    test('does not add or handle press accessibility actions outside Android', () => {
      setPlatform('ios');
      const onPress = jest.fn();

      const { pressable } = renderPressable(Component, {
        accessibilityActions: [{ name: 'magic', label: 'Magic' }],
        onPress,
      });

      expect(pressable.props.accessibilityActions).toEqual([
        { name: 'magic', label: 'Magic' },
      ]);
      expect(pressable.props.onAccessibilityAction).toBeUndefined();

      fireEvent(pressable, 'accessibilityAction', {
        nativeEvent: { actionName: 'activate' },
      });

      expect(onPress).not.toHaveBeenCalled();
    });

    test('keeps the user accessibility action handler unchanged outside Android', () => {
      setPlatform('ios');
      const onAccessibilityAction = jest.fn();

      const { pressable } = renderPressable(Component, {
        onAccessibilityAction,
        onPress: jest.fn(),
      });

      expect(pressable.props.onAccessibilityAction).toBe(onAccessibilityAction);
    });
  }
);
