import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';

import {
  LegacyRawButton,
  LegacyBaseButton,
  LegacyRectButton,
  LegacyBorderlessButton,
  LegacyPureNativeButton,
} from '../mocks/GestureButtons';

import {
  LegacyScrollView,
  LegacyFlatList,
  LegacySwitch,
  LegacyTextInput,
  LegacyRefreshControl,
} from '../mocks/gestureComponents';

import {
  TouchableHighlight,
  TouchableNativeFeedback,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from '../mocks/Touchables';

import LegacyPressable from '../mocks/Pressable';

import GestureHandlerRootView from '../components/GestureHandlerRootView';
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

test('Trigger press by text', () => {
  const onPress = jest.fn();
  const { getByText } = render(
    <GestureHandlerRootView>
      <Touchable activeOpacity={0.3} onPress={onPress}>
        <Text>Press Me</Text>
      </Touchable>
    </GestureHandlerRootView>
  );

  fireEvent.press(getByText('Press Me'));

  expect(onPress).toHaveBeenCalled();
});
