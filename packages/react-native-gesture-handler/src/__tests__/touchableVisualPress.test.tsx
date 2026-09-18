import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';

import { Touchable } from '../v3/components/Touchable/Touchable';
import type * as ScrollViewInterop from '../v3/scrollViewInterop';
import { isKeyboardDismissingTap } from '../v3/scrollViewInterop';

jest.mock('../v3/scrollViewInterop', () => ({
  ...jest.requireActual<typeof ScrollViewInterop>('../v3/scrollViewInterop'),
  isKeyboardDismissingTap: jest.fn(() => false),
}));

beforeEach(() => {
  jest.mocked(isKeyboardDismissingTap).mockReturnValue(false);
});

test('forwards visual targets independently of the existing press callbacks', () => {
  const onVisualPressChange = jest.fn();
  const onPressIn = jest.fn();
  const onPressOut = jest.fn();
  const onPress = jest.fn();
  render(
    <Touchable
      testID="button"
      onVisualPressChange={onVisualPressChange}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={onPress}>
      <Text>Press</Text>
    </Touchable>
  );
  const button = screen.getByTestId('button');
  const event = { nativeEvent: { pointerInside: true } };

  expect(onVisualPressChange).not.toHaveBeenCalled();
  fireEvent(button, 'buttonPressIn', event);
  expect(onPressIn).toHaveBeenCalledWith(event.nativeEvent);
  expect(onVisualPressChange).not.toHaveBeenCalled();

  fireEvent(button, 'buttonVisualPressChange', {
    nativeEvent: { pressed: true },
  });
  fireEvent(button, 'buttonPressOut', event);
  fireEvent(button, 'buttonPress', event);
  expect(onPressOut).toHaveBeenCalledWith(event.nativeEvent);
  expect(onPress).toHaveBeenCalledWith(event.nativeEvent);
  expect(onVisualPressChange.mock.calls).toEqual([[true]]);

  fireEvent(button, 'buttonVisualPressChange', {
    nativeEvent: { pressed: false },
  });
  expect(onVisualPressChange.mock.calls).toEqual([[true], [false]]);
  expect(onPressIn).toHaveBeenCalledTimes(1);
  expect(onPressOut).toHaveBeenCalledTimes(1);
  expect(onPress).toHaveBeenCalledTimes(1);
});

test('does not gate visual targets behind the keyboard tap filter', () => {
  jest.mocked(isKeyboardDismissingTap).mockReturnValue(true);
  const onPressIn = jest.fn();
  const onVisualPressChange = jest.fn();
  render(
    <Touchable
      testID="button"
      onPressIn={onPressIn}
      onVisualPressChange={onVisualPressChange}
    />
  );
  const button = screen.getByTestId('button');
  fireEvent(button, 'buttonPressIn', { nativeEvent: {} });
  fireEvent(button, 'buttonVisualPressChange', {
    nativeEvent: { pressed: true },
  });
  fireEvent(button, 'buttonVisualPressChange', {
    nativeEvent: { pressed: false },
  });
  expect(onPressIn).not.toHaveBeenCalled();
  expect(onVisualPressChange.mock.calls).toEqual([[true], [false]]);
});

test('leaves the native listener absent when no callback is supplied', () => {
  render(<Touchable testID="button" />);
  expect(
    screen.getByTestId('button').props.onButtonVisualPressChange
  ).toBeUndefined();
});
