import { renderHook } from '@testing-library/react-native';

import { createGestureController } from '../jestUtils';
import { State } from '../State';
import { usePanGesture, useTapGesture } from '../v3/hooks/gestures';

function mockedContinuousCallbacks() {
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

function mockedDiscreteCallbacks() {
  const order: string[] = [];

  return {
    order,
    callbacks: {
      onBegin: jest.fn(() => order.push('onBegin')),
      onActivate: jest.fn(() => order.push('onActivate')),
      onDeactivate: jest.fn(() => order.push('onDeactivate')),
      onFinalize: jest.fn(() => order.push('onFinalize')),
    },
  };
}

describe('createGestureController', () => {
  test('allows assertions after each gesture lifecycle step', () => {
    const { order, callbacks } = mockedContinuousCallbacks();
    const pan = renderHook(() =>
      usePanGesture({ disableReanimated: true, ...callbacks })
    ).result.current;
    const gesture = createGestureController(pan);

    gesture.begin({ translationX: 0 });

    expect(gesture.getState()).toBe(State.BEGAN);
    expect(order).toEqual(['onBegin']);
    expect(callbacks.onBegin).toHaveBeenCalledWith(
      expect.objectContaining({ translationX: 0 })
    );

    gesture.activate({ translationX: 10 });

    expect(gesture.getState()).toBe(State.ACTIVE);
    expect(order).toEqual(['onBegin', 'onActivate']);
    expect(callbacks.onActivate).toHaveBeenCalledWith(
      expect.objectContaining({ translationX: 10 })
    );

    gesture.update({ translationX: 50 });

    expect(gesture.getState()).toBe(State.ACTIVE);
    expect(order).toEqual(['onBegin', 'onActivate', 'onUpdate']);
    expect(callbacks.onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ translationX: 50 })
    );

    gesture.end({ translationX: 50 });

    expect(gesture.getState()).toBe(State.END);
    expect(order).toEqual([
      'onBegin',
      'onActivate',
      'onUpdate',
      'onDeactivate',
      'onFinalize',
    ]);
    expect(callbacks.onFinalize).toHaveBeenCalledWith(
      expect.objectContaining({ canceled: false, translationX: 50 })
    );
  });

  test('can fail a gesture before activation', () => {
    const { order, callbacks } = mockedDiscreteCallbacks();
    const tap = renderHook(() =>
      useTapGesture({ disableReanimated: true, ...callbacks })
    ).result.current;
    const gesture = createGestureController(tap);

    gesture.begin({ x: 10 });
    gesture.fail({ x: 10 });

    expect(gesture.getState()).toBe(State.FAILED);
    expect(order).toEqual(['onBegin', 'onFinalize']);
    expect(callbacks.onActivate).not.toHaveBeenCalled();
    expect(callbacks.onDeactivate).not.toHaveBeenCalled();
    expect(callbacks.onFinalize).toHaveBeenCalledWith(
      expect.objectContaining({ canceled: true, x: 10 })
    );
  });

  test('resolves gesture test ID strings internally', () => {
    const { order, callbacks } = mockedDiscreteCallbacks();
    renderHook(() =>
      useTapGesture({
        testID: 'controlled-tap',
        disableReanimated: true,
        ...callbacks,
      })
    );
    const gesture = createGestureController('controlled-tap');

    gesture.begin();
    gesture.activate();
    gesture.end();

    expect(order).toEqual([
      'onBegin',
      'onActivate',
      'onDeactivate',
      'onFinalize',
    ]);
  });

  test('guards against invalid lifecycle order', () => {
    const tap = renderHook(() => useTapGesture({ disableReanimated: true }))
      .result.current;
    const gesture = createGestureController(tap);

    expect(() => gesture.update()).toThrow(
      'Cannot update gesture from UNDETERMINED state.'
    );

    gesture.begin();

    expect(() => gesture.begin()).toThrow(
      'Cannot begin gesture from BEGAN state.'
    );
  });

  test('rejects raw state-machine fields in event payloads', () => {
    const tap = renderHook(() => useTapGesture({ disableReanimated: true }))
      .result.current;
    const gesture = createGestureController(tap);

    expect(() => gesture.begin({ state: State.BEGAN } as never)).toThrow(
      "createGestureController manages 'state' internally."
    );
  });

  test('disabled gestures are no-ops', () => {
    const { order, callbacks } = mockedContinuousCallbacks();
    const pan = renderHook(() =>
      usePanGesture({
        disableReanimated: true,
        enabled: false,
        ...callbacks,
      })
    ).result.current;
    const gesture = createGestureController(pan);

    gesture.begin();
    gesture.activate();
    gesture.update({ translationX: 50 });
    gesture.end();

    expect(gesture.getState()).toBe(State.UNDETERMINED);
    expect(order).toEqual([]);
  });
});
