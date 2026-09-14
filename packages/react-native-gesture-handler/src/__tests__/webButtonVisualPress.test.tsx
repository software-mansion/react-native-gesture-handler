import { act, render } from '@testing-library/react-native';
import React from 'react';
import type { NativeSyntheticEvent } from 'react-native';
import { StyleSheet } from 'react-native';

import { ButtonComponent } from '../components/GestureHandlerButton.web';
import type { ButtonVisualPressEvent } from '../specs/RNGestureHandlerButtonNativeComponent';
import { ButtonEventName } from '../web/tools/ButtonEvents';
import { GestureLifecycleEvent } from '../web/tools/GestureLifecycleEvents';

jest.mock('react-native/Libraries/Components/View/View', () => ({
  __esModule: true,
  default: 'View',
}));

jest.mock('../RNGestureHandlerModule.web', () => ({
  __esModule: true,
  default: {
    createGestureHandler: jest.fn(),
    attachGestureHandler: jest.fn(),
    detachGestureHandler: jest.fn(),
    dropGestureHandler: jest.fn(),
    setGestureHandlerConfig: jest.fn(),
  },
}));

class ButtonNode {
  private listeners = new Map<string, Set<(event: unknown) => void>>();

  addEventListener(type: string, listener: (event: unknown) => void) {
    const listeners = this.listeners.get(type) ?? new Set();
    listeners.add(listener);
    this.listeners.set(type, listeners);
  }

  removeEventListener(type: string, listener: (event: unknown) => void) {
    this.listeners.get(type)?.delete(listener);
  }

  dispatch(type: string) {
    this.listeners
      .get(type)
      ?.forEach((listener) => listener({ detail: { pointerInside: true } }));
  }
}

function mountButton(
  props: Partial<React.ComponentProps<typeof ButtonComponent>> = {}
) {
  const node = new ButtonNode();
  const onVisualPressChange = jest.fn<
    void,
    [NativeSyntheticEvent<ButtonVisualPressEvent>]
  >();
  const buttonProps = {
    handlerTag: 1,
    onButtonVisualPressChange: onVisualPressChange,
    ...props,
  };
  const result = render(<ButtonComponent {...buttonProps} />, {
    createNodeMock: () => node,
  });
  return {
    node,
    onVisualPressChange,
    ...result,
    update: (newProps: Partial<React.ComponentProps<typeof ButtonComponent>>) =>
      result.rerender(<ButtonComponent {...buttonProps} {...newProps} />),
  };
}

beforeEach(() => {
  jest.useFakeTimers();
  jest.spyOn(performance, 'now').mockImplementation(() => Date.now());
  jest.setSystemTime(1000);
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
});

function targets(
  callback: jest.Mock<void, [NativeSyntheticEvent<ButtonVisualPressEvent>]>
) {
  return callback.mock.calls.map(([event]) => event.nativeEvent.pressed);
}

test('retains the quick-tap target while the existing press callbacks finish', async () => {
  const onButtonPressIn = jest.fn();
  const onButtonPressOut = jest.fn();
  const onButtonPress = jest.fn();
  const { node, onVisualPressChange } = mountButton({
    onButtonPressIn,
    onButtonPressOut,
    onButtonPress,
  });
  expect(targets(onVisualPressChange)).toEqual([]);
  await act(() => {
    node.dispatch(ButtonEventName.PressIn);
    jest.advanceTimersByTime(10);
    node.dispatch(ButtonEventName.PressOut);
    node.dispatch(ButtonEventName.Press);
  });
  expect(targets(onVisualPressChange)).toEqual([true]);
  expect(onButtonPressIn).toHaveBeenCalledTimes(1);
  expect(onButtonPressOut).toHaveBeenCalledTimes(1);
  expect(onButtonPress).toHaveBeenCalledTimes(1);
  await act(() => jest.advanceTimersByTime(39));
  expect(targets(onVisualPressChange)).toEqual([true]);
  await act(() => jest.advanceTimersByTime(1));
  expect(targets(onVisualPressChange)).toEqual([true, false]);
});

test('reports both immediate edges even when React batches them', async () => {
  const { node, onVisualPressChange } = mountButton({
    tapAnimationInDuration: 0,
  });
  await act(() => {
    node.dispatch(ButtonEventName.PressIn);
    node.dispatch(ButtonEventName.PressOut);
  });
  expect(targets(onVisualPressChange)).toEqual([true, false]);
});

test('a second press cancels the pending release without repeating true', async () => {
  const { node, onVisualPressChange } = mountButton();
  await act(() => {
    node.dispatch(ButtonEventName.PressIn);
    jest.advanceTimersByTime(10);
    node.dispatch(ButtonEventName.PressOut);
    jest.advanceTimersByTime(10);
    node.dispatch(ButtonEventName.PressIn);
    jest.advanceTimersByTime(100);
  });
  expect(targets(onVisualPressChange)).toEqual([true]);
  await act(() => node.dispatch(ButtonEventName.PressOut));
  expect(targets(onVisualPressChange)).toEqual([true, false]);
});

test('cancellation balances once and a subsequent press can re-enter', async () => {
  const { node, onVisualPressChange } = mountButton();
  await act(() => {
    node.dispatch(ButtonEventName.PressIn);
    node.dispatch(ButtonEventName.PressOut);
    node.dispatch(GestureLifecycleEvent.Canceled);
    node.dispatch(GestureLifecycleEvent.Canceled);
    jest.runAllTimers();
    node.dispatch(ButtonEventName.PressIn);
  });
  expect(targets(onVisualPressChange)).toEqual([true, false, true]);
});

test.each([false, true])(
  'disable ends feedback with pending release %s',
  async (releaseFirst) => {
    const { node, onVisualPressChange, update, getByTestId } = mountButton({
      testID: 'button',
      activeScale: 0.8,
    });
    await act(() => {
      node.dispatch(ButtonEventName.PressIn);
      if (releaseFirst) {
        node.dispatch(ButtonEventName.PressOut);
      }
    });
    update({ enabled: false });
    await act(() => jest.runAllTimers());
    expect(targets(onVisualPressChange)).toEqual([true, false]);
    update({ enabled: true });
    expect(targets(onVisualPressChange)).toEqual([true, false]);
    expect(StyleSheet.flatten(getByTestId('button').props.style)).toMatchObject(
      {
        transform: [{ scale: 1 }],
      }
    );
    await act(() => node.dispatch(ButtonEventName.PressIn));
    expect(StyleSheet.flatten(getByTestId('button').props.style)).toMatchObject(
      {
        transform: [{ scale: 0.8 }],
      }
    );
    expect(targets(onVisualPressChange)).toEqual([true, false, true]);
  }
);

test('a pending release uses the latest callback without replaying true', async () => {
  const { node, onVisualPressChange, update } = mountButton();
  await act(() => {
    node.dispatch(ButtonEventName.PressIn);
    node.dispatch(ButtonEventName.PressOut);
  });
  const replacement = jest.fn<
    void,
    [NativeSyntheticEvent<ButtonVisualPressEvent>]
  >();
  update({ onButtonVisualPressChange: replacement });
  expect(targets(replacement)).toEqual([]);
  await act(() => jest.runAllTimers());
  expect(targets(onVisualPressChange)).toEqual([true]);
  expect(targets(replacement)).toEqual([false]);
});

test('unmount cancels a pending release', async () => {
  const { node, onVisualPressChange, unmount } = mountButton();
  await act(() => {
    node.dispatch(ButtonEventName.PressIn);
    node.dispatch(ButtonEventName.PressOut);
  });
  unmount();
  await act(() => jest.runAllTimers());
  expect(targets(onVisualPressChange)).toEqual([true]);
  expect(jest.getTimerCount()).toBe(0);
});
