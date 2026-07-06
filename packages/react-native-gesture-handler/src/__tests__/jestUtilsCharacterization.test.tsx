import { renderHook } from '@testing-library/react-native';

import { Gesture } from '../index';
import { fireGestureHandler } from '../jestUtils';
import { State } from '../State';
import { usePanGesture, useTapGesture } from '../v3/hooks/gestures';

// These tests record the current behavior of the low-level
// `fireGestureHandler` API so the semantic `fireGesture` API can be built
// next to it without changing it.

function mockedV3Callbacks() {
  const order: string[] = [];
  return {
    order,
    callbacks: {
      onBegin: jest.fn(() => order.push('onBegin')),
      onActivate: jest.fn(() => order.push('onActivate')),
      onUpdate: jest.fn(() => order.push('onUpdate')),
      onDeactivate: jest.fn(() => order.push('onDeactivate')),
      onFinalize: jest.fn(() => order.push('onFinalize')),
    },
  };
}

describe('fireGestureHandler characterization: v3 hook gestures', () => {
  test('successful pan stream invokes the full v3 lifecycle in order', () => {
    const { order, callbacks } = mockedV3Callbacks();
    const pan = renderHook(() =>
      usePanGesture({ disableReanimated: true, ...callbacks })
    ).result.current;

    fireGestureHandler(pan, [
      { state: State.BEGAN },
      { state: State.ACTIVE },
      { translationX: 10 },
      { translationX: 20 },
      { state: State.END },
    ]);

    expect(order).toEqual([
      'onBegin',
      'onActivate',
      'onUpdate',
      'onUpdate',
      'onDeactivate',
      'onFinalize',
    ]);
    expect(callbacks.onFinalize).toHaveBeenCalledWith(
      expect.objectContaining({ canceled: false })
    );
  });

  test('explicit failure stream still synthesizes an ACTIVE event', () => {
    // The low-level API always fills the BEGAN -> ACTIVE -> END sequence for
    // continuous handlers, so a "failure before activation" cannot be
    // expressed without activation callbacks being invoked.
    const { order, callbacks } = mockedV3Callbacks();
    const pan = renderHook(() =>
      usePanGesture({ disableReanimated: true, ...callbacks })
    ).result.current;

    fireGestureHandler(pan, [{ state: State.BEGAN }, { state: State.FAILED }]);

    expect(order).toEqual([
      'onBegin',
      'onActivate',
      'onDeactivate',
      'onFinalize',
    ]);
    expect(callbacks.onFinalize).toHaveBeenCalledWith(
      expect.objectContaining({ canceled: true })
    );
  });

  test('cancellation after activation finalizes with canceled flag', () => {
    const { order, callbacks } = mockedV3Callbacks();
    const pan = renderHook(() =>
      usePanGesture({ disableReanimated: true, ...callbacks })
    ).result.current;

    fireGestureHandler(pan, [
      { state: State.BEGAN },
      { state: State.ACTIVE },
      { state: State.CANCELLED },
    ]);

    expect(order).toEqual([
      'onBegin',
      'onActivate',
      'onDeactivate',
      'onFinalize',
    ]);
    expect(callbacks.onDeactivate).toHaveBeenCalledWith(
      expect.objectContaining({ canceled: true })
    );
    expect(callbacks.onFinalize).toHaveBeenCalledWith(
      expect.objectContaining({ canceled: true })
    );
  });

  test('discrete tap gesture always receives a synthesized activation', () => {
    // Even for discrete handlers, the low-level API fills the ACTIVE state
    // between BEGAN and the terminal event.
    const { order, callbacks } = mockedV3Callbacks();
    const tap = renderHook(() =>
      useTapGesture({ disableReanimated: true, ...callbacks })
    ).result.current;

    fireGestureHandler(tap, [{ state: State.BEGAN }, { state: State.END }]);

    expect(order).toEqual([
      'onBegin',
      'onActivate',
      'onDeactivate',
      'onFinalize',
    ]);
  });

  test('disabled v3 hook gesture receives no callbacks', () => {
    const { order, callbacks } = mockedV3Callbacks();
    const pan = renderHook(() =>
      usePanGesture({ disableReanimated: true, enabled: false, ...callbacks })
    ).result.current;

    fireGestureHandler(pan, [
      { state: State.BEGAN },
      { state: State.ACTIVE },
      { state: State.END },
    ]);

    expect(order).toEqual([]);
  });
});

describe('fireGestureHandler characterization: v2 builder gestures', () => {
  test('disabled v2 gesture receives no callbacks', () => {
    const begin = jest.fn();
    const pan = Gesture.Pan().enabled(false).onBegin(begin);
    // Builder gestures need a handler tag to be dispatchable.
    pan.handlerTag = 999;

    fireGestureHandler(pan, [
      { state: State.BEGAN },
      { state: State.ACTIVE },
      { state: State.END },
    ]);

    expect(begin).not.toHaveBeenCalled();
  });
});
