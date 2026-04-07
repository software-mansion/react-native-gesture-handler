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

import LegacyPressable from '../mocks/Pressable';

import {
  RawButton,
  BaseButton,
  RectButton,
  BorderlessButton,
  Clickable,
  ScrollView,
  FlatList,
  Switch,
  TextInput,
  RefreshControl,
} from '../mocks/v3GestureComponents';

describe('Jest mocks – v3 components render without crashing', () => {
  test('RawButton', () => {
    expect(() => render(<RawButton />)).not.toThrow();
  });

  test('BaseButton', () => {
    expect(() => render(<BaseButton />)).not.toThrow();
  });

  test('RectButton', () => {
    expect(() => render(<RectButton />)).not.toThrow();
  });

  test('BorderlessButton', () => {
    expect(() => render(<BorderlessButton />)).not.toThrow();
  });

  test('Clickable', () => {
    expect(() => render(<Clickable />)).not.toThrow();
  });

  test('Pressable (v3 shares legacy mock)', () => {
    expect(() => render(<LegacyPressable />)).not.toThrow();
  });

  test('ScrollView', () => {
    expect(() => render(<ScrollView />)).not.toThrow();
  });

  test('FlatList', () => {
    expect(() =>
      render(<FlatList data={[]} renderItem={() => null} />)
    ).not.toThrow();
  });

  test('Switch', () => {
    expect(() => render(<Switch />)).not.toThrow();
  });

  test('TextInput', () => {
    expect(() => render(<TextInput />)).not.toThrow();
  });

  test('RefreshControl', () => {
    expect(() => render(<RefreshControl refreshing={false} />)).not.toThrow();
  });
});

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
});

test('Trigger press by text', () => {
  const onPress = jest.fn();
  const { getByText } = render(
    <Clickable activeOpacity={0.3} onPress={onPress}>
      <Text>Press Me</Text>
    </Clickable>
  );

  fireEvent.press(getByText('Press Me'));

  expect(onPress).toHaveBeenCalled();
});
