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
import { Touchable } from '../v3/components';

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
  fireEvent(screen.getByTestId('touchable'), 'press', {
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
