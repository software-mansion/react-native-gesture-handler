import { renderHook } from '@testing-library/react-native';

import { createGestureController } from '../jestUtils';
import { State } from '../State';
import type { PanGesture, TapGesture } from '../v3/hooks/gestures';
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

function assertGestureControllerTypes(pan: PanGesture, tap: TapGesture) {
  const panController = createGestureController(pan);
  panController.begin({ x: 1 });
  panController.update({ translationX: 1, velocityX: 2 });
  // @ts-expect-error unknown pan payload field
  panController.update({ translationXX: 1 });
  // @ts-expect-error raw state-machine fields are managed internally
  panController.begin({ state: State.BEGAN });

  const tapController = createGestureController(tap);
  tapController.begin({ x: 1 });
  // @ts-expect-error tap payloads do not include pan translation fields
  tapController.update({ translationX: 1 });

  const stringController = createGestureController<{ translationX: number }>(
    'pan-id'
  );
  stringController.update({ translationX: 1 });
  // @ts-expect-error explicit payload type is respected for string targets
  stringController.update({ translationXX: 1 });
}

void assertGestureControllerTypes;

function getControllerState(gesture: object): State {
  return (gesture as { state: State }).state;
}

describe('createGestureController', () => {
  test('transitions to the expected state after each gesture lifecycle step', () => {
    const { order, callbacks } = mockedContinuousCallbacks();
    const pan = renderHook(() =>
      usePanGesture({ disableReanimated: true, ...callbacks })
    ).result.current;
    const gesture = createGestureController(pan);

    gesture.begin({ translationX: 0 });

    expect(order).toEqual(['onBegin']);
    expect(getControllerState(gesture)).toBe(State.BEGAN);
    expect(callbacks.onBegin).toHaveBeenCalledWith(
      expect.objectContaining({ translationX: 0 })
    );

    gesture.activate({ translationX: 10 });

    expect(order).toEqual(['onBegin', 'onActivate']);
    expect(getControllerState(gesture)).toBe(State.ACTIVE);
    expect(callbacks.onActivate).toHaveBeenCalledWith(
      expect.objectContaining({ translationX: 10 })
    );

    gesture.update({ translationX: 50 });

    expect(order).toEqual(['onBegin', 'onActivate', 'onUpdate']);
    expect(getControllerState(gesture)).toBe(State.ACTIVE);
    expect(callbacks.onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ translationX: 50 })
    );

    gesture.end({ translationX: 50 });

    expect(order).toEqual([
      'onBegin',
      'onActivate',
      'onUpdate',
      'onDeactivate',
      'onFinalize',
    ]);
    expect(getControllerState(gesture)).toBe(State.END);
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

    expect(order).toEqual(['onBegin', 'onFinalize']);
    expect(getControllerState(gesture)).toBe(State.FAILED);
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

  test.each([
    ['end', State.END],
    ['fail', State.FAILED],
    ['cancel', State.CANCELLED],
  ] as const)(
    'reuses the controller for streams ending with %s',
    (terminalAction, terminalState) => {
      const onBegin = jest.fn();
      const onFinalize = jest.fn();
      const tap = renderHook(() =>
        useTapGesture({ disableReanimated: true, onBegin, onFinalize })
      ).result.current;
      const gesture = createGestureController(tap);

      gesture.begin();
      gesture[terminalAction]();

      expect(getControllerState(gesture)).toBe(terminalState);

      gesture.begin();

      expect(getControllerState(gesture)).toBe(State.BEGAN);

      gesture[terminalAction]();

      expect(getControllerState(gesture)).toBe(terminalState);
      expect(onBegin).toHaveBeenCalledTimes(2);
      expect(onFinalize).toHaveBeenCalledTimes(2);
    }
  );

  test('rejects raw state-machine fields in event payloads', () => {
    const onBegin = jest.fn();
    const tap = renderHook(() =>
      useTapGesture({ disableReanimated: true, onBegin })
    ).result.current;
    const gesture = createGestureController(tap);

    expect(() => gesture.begin({ state: State.BEGAN } as never)).toThrow(
      "createGestureController manages 'state' internally."
    );
    expect(getControllerState(gesture)).toBe(State.UNDETERMINED);
    expect(onBegin).not.toHaveBeenCalled();

    gesture.begin();

    expect(getControllerState(gesture)).toBe(State.BEGAN);
  });

  test('uses the latest callbacks after rerender', () => {
    const calls: string[] = [];
    const hook = renderHook(
      ({ value }: { value: number }) =>
        usePanGesture({
          disableReanimated: true,
          onBegin: () => calls.push(`begin-${value}`),
          onActivate: () => calls.push(`activate-${value}`),
        }),
      { initialProps: { value: 1 } }
    );
    const gesture = createGestureController(hook.result.current);

    gesture.begin();
    hook.rerender({ value: 2 });
    gesture.activate();

    expect(calls).toEqual(['begin-1', 'activate-2']);
  });

  test('uses the latest enabled value after rerender', () => {
    const onBegin = jest.fn();
    const hook = renderHook(
      ({ enabled }: { enabled: boolean }) =>
        usePanGesture({ disableReanimated: true, enabled, onBegin }),
      { initialProps: { enabled: true } }
    );
    const gesture = createGestureController(hook.result.current);

    hook.rerender({ enabled: false });
    gesture.begin();

    expect(getControllerState(gesture)).toBe(State.UNDETERMINED);
    expect(onBegin).not.toHaveBeenCalled();

    hook.rerender({ enabled: true });
    gesture.begin();

    expect(getControllerState(gesture)).toBe(State.BEGAN);
    expect(onBegin).toHaveBeenCalledTimes(1);
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

    expect(getControllerState(gesture)).toBe(State.UNDETERMINED);
    expect(order).toEqual([]);
  });
});
