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

test.each([
  ['Pressable', {}],
  // A relation prop routes `Pressable` to the `StatefulPressable` engine.
  ['StatefulPressable', { simultaneousWith: [] }],
])(
  'disabled %s fires none of its callbacks through testing-library',
  (_engine, engineProps) => {
    // On a device, `disabled` turns the native button off, so none of these
    // callbacks fire. Testing-library calls the button's `testOnly_*` props in
    // place of the native events, and falls back to handlers further up the
    // tree when one is missing. So each of them has to be there and do
    // nothing, even when called without an event, as a bare
    // `fireEvent(button, 'pressIn')` does.
    const callbacks = {
      onPress: jest.fn(),
      onPressIn: jest.fn(),
      onPressOut: jest.fn(),
      onLongPress: jest.fn(),
      onHoverIn: jest.fn(),
      onHoverOut: jest.fn(),
    };

    const { rerender } = render(
      <GestureHandlerRootView>
        <Pressable testID="pressable" disabled {...engineProps} {...callbacks}>
          <Text>Press Me</Text>
        </Pressable>
      </GestureHandlerRootView>
    );

    const { props } = screen.getByTestId('pressable');

    for (const name of Object.keys(callbacks)) {
      const handler: unknown = props[`testOnly_${name}`];

      expect(handler).toEqual(expect.any(Function));
      expect(() => (handler as () => void)()).not.toThrow();
    }

    for (const callback of Object.values(callbacks)) {
      expect(callback).not.toHaveBeenCalled();
    }

    // Callbacks that weren't given stay unset, as on an enabled button, so
    // testing-library keeps looking further up the tree, e.g. for an enabled
    // `Pressable` around this one.
    rerender(
      <GestureHandlerRootView>
        <Pressable testID="pressable" disabled {...engineProps}>
          <Text>Press Me</Text>
        </Pressable>
      </GestureHandlerRootView>
    );

    const { props: propsWithoutCallbacks } = screen.getByTestId('pressable');

    for (const name of Object.keys(callbacks)) {
      expect(propsWithoutCallbacks[`testOnly_${name}`]).toBeUndefined();
    }
  }
);
