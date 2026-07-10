import { renderHook } from '@testing-library/react-native';

import {
  createGestureController,
  doubleTap,
  fireGesture,
  longPress,
  pinch,
  rotate,
  swipe,
  tap,
} from '../jestUtils';
import { State } from '../State';
import {
  useCompetingGestures,
  useSimultaneousGestures,
} from '../v3/hooks/composition';
import type { PanGesture, TapGesture } from '../v3/hooks/gestures';
import {
  useLongPressGesture,
  usePanGesture,
  usePinchGesture,
  useRotationGesture,
  useTapGesture,
} from '../v3/hooks/gestures';

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

describe('fireGesture', () => {
  test('provides a tap convenience helper', () => {
    const onActivate = jest.fn();
    const gesture = renderHook(() =>
      useTapGesture({ disableReanimated: true, onActivate })
    ).result.current;

    fireGesture(gesture, tap({ at: { x: 20, y: 40 } }));

    expect(onActivate).toHaveBeenCalledWith(
      expect.objectContaining({ x: 20, y: 40 })
    );
  });

  test('advances timer-dependent long presses explicitly', () => {
    jest.useFakeTimers();

    try {
      const onActivate = jest.fn();
      const gesture = renderHook(() =>
        useLongPressGesture({
          disableReanimated: true,
          minDuration: 50,
          onActivate,
        })
      ).result.current;

      fireGesture(gesture, longPress({ at: { x: 20, y: 40 }, duration: 50 }), {
        advanceTimers: jest.advanceTimersByTime,
      });

      expect(onActivate).toHaveBeenCalledTimes(1);
    } finally {
      jest.useRealTimers();
    }
  });

  test('supports multi-tap timing through doubleTap', () => {
    jest.useFakeTimers();

    try {
      const onActivate = jest.fn();
      const gesture = renderHook(() =>
        useTapGesture({
          disableReanimated: true,
          numberOfTaps: 2,
          onActivate,
        })
      ).result.current;

      fireGesture(gesture, doubleTap({ at: { x: 20, y: 40 } }), {
        advanceTimers: jest.advanceTimersByTime,
      });

      expect(onActivate).toHaveBeenCalledTimes(1);
    } finally {
      jest.useRealTimers();
    }
  });

  test('provides pinch and rotate helpers over multi-pointer input', () => {
    const onPinchActivate = jest.fn();
    const onRotationActivate = jest.fn();
    const gestures = renderHook(() => ({
      pinch: usePinchGesture({
        disableReanimated: true,
        onActivate: onPinchActivate,
      }),
      rotation: useRotationGesture({
        disableReanimated: true,
        onActivate: onRotationActivate,
      }),
    })).result.current;

    fireGesture(
      gestures.pinch,
      pinch({
        from: [
          { x: 0, y: 0 },
          { x: 0, y: 40 },
        ],
        to: [
          { x: 0, y: 0 },
          { x: 0, y: 100 },
        ],
        steps: 3,
      })
    );
    fireGesture(
      gestures.rotation,
      rotate({
        center: { x: 50, y: 50 },
        radius: 30,
        fromAngle: 0,
        toAngle: Math.PI / 2,
        steps: 3,
      })
    );

    expect(onPinchActivate).toHaveBeenCalledTimes(1);
    expect(onRotationActivate).toHaveBeenCalledTimes(1);
  });

  test('uses web recognizers and the arbitrator for competing gestures', () => {
    const onPanActivate = jest.fn();
    const onTapActivate = jest.fn();
    const onTapFinalize = jest.fn();

    const competingGestures = renderHook(() => {
      const tap = useTapGesture({
        disableReanimated: true,
        maxDistance: 10,
        onActivate: onTapActivate,
        onFinalize: onTapFinalize,
      });
      const pan = usePanGesture({
        disableReanimated: true,
        minDistance: 10,
        onActivate: onPanActivate,
      });

      return useCompetingGestures(tap, pan);
    }).result.current;

    fireGesture(
      competingGestures,
      swipe({
        from: { x: 0, y: 0 },
        to: { x: 100, y: 0 },
        steps: 4,
      })
    );

    expect(onPanActivate).toHaveBeenCalledTimes(1);
    expect(onTapActivate).not.toHaveBeenCalled();
    expect(onTapFinalize).toHaveBeenCalledWith(
      expect.objectContaining({ canceled: true })
    );
  });

  test('lets simultaneous gestures observe the same pointer stream', () => {
    const onPanActivate = jest.fn();
    const onTapActivate = jest.fn();

    const simultaneousGestures = renderHook(() => {
      const tap = useTapGesture({
        disableReanimated: true,
        onActivate: onTapActivate,
      });
      const pan = usePanGesture({
        disableReanimated: true,
        minDistance: 10,
        onActivate: onPanActivate,
      });

      return useSimultaneousGestures(tap, pan);
    }).result.current;

    fireGesture(
      simultaneousGestures,
      swipe({
        from: { x: 0, y: 0 },
        to: { x: 100, y: 0 },
      })
    );

    expect(onPanActivate).toHaveBeenCalledTimes(1);
    expect(onTapActivate).toHaveBeenCalledTimes(1);
  });
});
