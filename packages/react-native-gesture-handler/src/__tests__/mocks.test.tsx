import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';

import GestureHandlerRootView from '../components/GestureHandlerRootView';
import {
  LegacyBaseButton,
  LegacyBorderlessButton,
  LegacyPureNativeButton,
  LegacyRawButton,
  LegacyRectButton,
} from '../mocks/GestureButtons';
import {
  LegacyFlatList,
  LegacyRefreshControl,
  LegacyScrollView,
  LegacySwitch,
  LegacyTextInput,
} from '../mocks/gestureComponents';
import LegacyPressable from '../mocks/Pressable';
import {
  TouchableHighlight,
  TouchableNativeFeedback,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from '../mocks/Touchables';
import { Pressable, Touchable } from '../v3/components';

describe('Jest mocks – legacy components render without crashing', () => {
  test('LegacyRawButton', () => {
    expect(() => render(<LegacyRawButton />)).not.toThrow();
  });

  test('LegacyBaseButton', () => {
    expect(() => render(<LegacyBaseButton />)).not.toThrow();
  });

  test('LegacyRectButton', () => {
    expect(() => render(<LegacyRectButton />)).not.toThrow();
  });

  test('LegacyBorderlessButton', () => {
    expect(() => render(<LegacyBorderlessButton />)).not.toThrow();
  });

  test('LegacyPureNativeButton', () => {
    expect(() => render(<LegacyPureNativeButton />)).not.toThrow();
  });

  test('LegacyPressable', () => {
    expect(() => render(<LegacyPressable />)).not.toThrow();
  });

  test('LegacyScrollView', () => {
    expect(() => render(<LegacyScrollView />)).not.toThrow();
  });

  test('LegacyFlatList', () => {
    expect(() =>
      render(<LegacyFlatList data={[]} renderItem={() => null} />)
    ).not.toThrow();
  });

  test('LegacySwitch', () => {
    expect(() => render(<LegacySwitch />)).not.toThrow();
  });

  test('LegacyTextInput', () => {
    expect(() => render(<LegacyTextInput />)).not.toThrow();
  });

  test('LegacyRefreshControl', () => {
    expect(() =>
      render(<LegacyRefreshControl refreshing={false} />)
    ).not.toThrow();
  });

  test('TouchableHighlight', () => {
    expect(() =>
      render(
        <TouchableHighlight>
          <Text>Test</Text>
        </TouchableHighlight>
      )
    ).not.toThrow();
  });

  test('TouchableNativeFeedback', () => {
    expect(() =>
      render(
        <TouchableNativeFeedback>
          <Text>Test</Text>
        </TouchableNativeFeedback>
      )
    ).not.toThrow();
  });

  test('TouchableOpacity', () => {
    expect(() =>
      render(
        <TouchableOpacity>
          <Text>Test</Text>
        </TouchableOpacity>
      )
    ).not.toThrow();
  });

  test('TouchableWithoutFeedback', () => {
    expect(() =>
      render(
        <TouchableWithoutFeedback>
          <Text>Test</Text>
        </TouchableWithoutFeedback>
      )
    ).not.toThrow();
  });
});

test('Trigger Touchable press', () => {
  const onPress = jest.fn();
  render(
    <GestureHandlerRootView>
      <Touchable activeOpacity={0.3} testID="touchable" onPress={onPress}>
        <Text>Press Me</Text>
      </Touchable>
    </GestureHandlerRootView>
  );

  // The press state machine runs on the native side — the JS layer receives
  // the resulting press events directly from the button.
  fireEvent(screen.getByTestId('touchable'), 'buttonPress', {
    nativeEvent: {
      pointerInside: true,
      x: 0,
      y: 0,
      absoluteX: 0,
      absoluteY: 0,
      numberOfPointers: 1,
      pointerType: 0,
    },
  });

  expect(onPress).toHaveBeenCalled();
});

test('Pressable exposes its press handlers to testing-library', () => {
  // `Pressable` renders `PressableWithTouchable` unless a relation prop is
  // passed. Both engines have to forward the handlers as `testOnly_*` props on
  // the button, since that is what `fireEvent(element, 'press')` picks up in a
  // test environment — the press state machine itself runs natively.
  const onPress = jest.fn();
  const onPressIn = jest.fn();
  const onPressOut = jest.fn();
  const onLongPress = jest.fn();

  render(
    <GestureHandlerRootView>
      <Pressable
        testID="pressable"
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onLongPress={onLongPress}>
        <Text>Press Me</Text>
      </Pressable>
    </GestureHandlerRootView>
  );

  const button = screen.getByTestId('pressable');

  expect(button.props.testOnly_onPress).toBe(onPress);
  expect(button.props.testOnly_onPressIn).toBe(onPressIn);
  expect(button.props.testOnly_onPressOut).toBe(onPressOut);
  expect(button.props.testOnly_onLongPress).toBe(onLongPress);
});

test('Pressable exposes its hover handlers to testing-library', () => {
  const onHoverIn = jest.fn();
  const onHoverOut = jest.fn();

  render(
    <GestureHandlerRootView>
      <Pressable
        testID="pressable"
        onHoverIn={onHoverIn}
        onHoverOut={onHoverOut}>
        <Text>Hover Me</Text>
      </Pressable>
    </GestureHandlerRootView>
  );

  const button = screen.getByTestId('pressable');

  expect(button.props.testOnly_onHoverIn).toBe(onHoverIn);
  expect(button.props.testOnly_onHoverOut).toBe(onHoverOut);
});

test('StatefulPressable exposes its press and hover handlers to testing-library', () => {
  // A relation prop routes `Pressable` to the `StatefulPressable` engine,
  // which has to forward the same `testOnly_*` props as the default engine.
  const onPress = jest.fn();
  const onHoverIn = jest.fn();
  const onHoverOut = jest.fn();

  render(
    <GestureHandlerRootView>
      <Pressable
        testID="pressable"
        simultaneousWith={[]}
        onPress={onPress}
        onHoverIn={onHoverIn}
        onHoverOut={onHoverOut}>
        <Text>Press Me</Text>
      </Pressable>
    </GestureHandlerRootView>
  );

  const button = screen.getByTestId('pressable');

  expect(button.props.testOnly_onPress).toBe(onPress);
  expect(button.props.testOnly_onHoverIn).toBe(onHoverIn);
  expect(button.props.testOnly_onHoverOut).toBe(onHoverOut);
});

// Fresh mocks for every callback `Pressable` forwards as a `testOnly_*` prop.
const pressableCallbacks = () => ({
  onPress: jest.fn(),
  onPressIn: jest.fn(),
  onPressOut: jest.fn(),
  onLongPress: jest.fn(),
  onHoverIn: jest.fn(),
  onHoverOut: jest.fn(),
});

// Names of the `testOnly_*` handlers testing-library could call on the element.
function exposedTestOnlyHandlers(testID: string) {
  const { props } = screen.getByTestId(testID);

  return Object.keys(props).filter(
    (key) => key.startsWith('testOnly_on') && typeof props[key] === 'function'
  );
}

test('disabled Pressable does not expose its handlers to testing-library', () => {
  // On a device, `disabled` turns the native button off, so none of these
  // callbacks fire. The `testOnly_*` props have to follow suit, otherwise
  // `fireEvent(element, 'press')` still calls `onPress` in a test environment.
  render(
    <GestureHandlerRootView>
      <Pressable testID="pressable" disabled {...pressableCallbacks()}>
        <Text>Press Me</Text>
      </Pressable>
    </GestureHandlerRootView>
  );

  expect(exposedTestOnlyHandlers('pressable')).toEqual([]);
});

test('disabled StatefulPressable does not expose its handlers to testing-library', () => {
  render(
    <GestureHandlerRootView>
      <Pressable
        testID="pressable"
        disabled
        simultaneousWith={[]}
        {...pressableCallbacks()}>
        <Text>Press Me</Text>
      </Pressable>
    </GestureHandlerRootView>
  );

  expect(exposedTestOnlyHandlers('pressable')).toEqual([]);
});
