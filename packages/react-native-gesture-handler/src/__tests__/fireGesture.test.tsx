import { render, renderHook, screen } from '@testing-library/react-native';
import { useState } from 'react';
import { Text, View } from 'react-native';

import GestureHandlerRootView from '../components/GestureHandlerRootView';
import GestureArbitrator from '../handlers/gestureArbitration/GestureArbitrator';
import { Gesture } from '../index';
import {
  fireGesture,
  fireGestureHandler,
  getByGestureTestId,
} from '../jestUtils';
import { GestureDetector } from '../v3';
import type { PanGesture, TapGesture } from '../v3/hooks/gestures';
import {
  useFlingGesture,
  useLongPressGesture,
  usePanGesture,
  usePinchGesture,
  useTapGesture,
} from '../v3/hooks/gestures';

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

function mockedTapCallbacks() {
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

describe('fireGesture: tap', () => {
  test('successful tap invokes the expected v3 lifecycle', () => {
    const { order, callbacks } = mockedTapCallbacks();
    const tap = renderHook(() =>
      useTapGesture({ disableReanimated: true, ...callbacks })
    ).result.current;

    fireGesture(tap);

    expect(order).toEqual([
      'onBegin',
      'onActivate',
      'onDeactivate',
      'onFinalize',
    ]);
    expect(callbacks.onDeactivate).toHaveBeenCalledWith(
      expect.objectContaining({ canceled: false })
    );
    expect(callbacks.onFinalize).toHaveBeenCalledWith(
      expect.objectContaining({ canceled: false })
    );
  });

  test('event payload defaults are stable', () => {
    const { callbacks } = mockedTapCallbacks();
    const tap = renderHook(() =>
      useTapGesture({ disableReanimated: true, ...callbacks })
    ).result.current;

    fireGesture(tap);

    expect(callbacks.onActivate).toHaveBeenCalledWith({
      handlerTag: tap.handlerTag,
      x: 0,
      y: 0,
      absoluteX: 0,
      absoluteY: 0,
      numberOfPointers: 1,
      pointerType: expect.anything(),
    });
  });

  test('user-supplied event values reach application callbacks', () => {
    const { callbacks } = mockedTapCallbacks();
    const tap = renderHook(() =>
      useTapGesture({ disableReanimated: true, ...callbacks })
    ).result.current;

    fireGesture(tap, { event: { x: 5, y: 15 } });

    expect(callbacks.onBegin).toHaveBeenCalledWith(
      expect.objectContaining({ x: 5, y: 15 })
    );
    expect(callbacks.onActivate).toHaveBeenCalledWith(
      expect.objectContaining({ x: 5, y: 15 })
    );
  });

  test('failed tap finalizes without activation or deactivation', () => {
    const { order, callbacks } = mockedTapCallbacks();
    const tap = renderHook(() =>
      useTapGesture({ disableReanimated: true, ...callbacks })
    ).result.current;

    fireGesture(tap, { outcome: 'failed' });

    expect(order).toEqual(['onBegin', 'onFinalize']);
    expect(callbacks.onFinalize).toHaveBeenCalledWith(
      expect.objectContaining({ canceled: true })
    );
  });
});

describe('fireGesture: pan', () => {
  test('successful pan dispatches every supplied update in order', () => {
    const { order, callbacks } = mockedV3Callbacks();
    const pan = renderHook(() =>
      usePanGesture({ disableReanimated: true, ...callbacks })
    ).result.current;

    fireGesture(pan, {
      updates: [
        { translationX: 20, translationY: 0 },
        { translationX: 100, translationY: 0 },
      ],
    });

    expect(order).toEqual([
      'onBegin',
      'onActivate',
      'onUpdate',
      'onUpdate',
      'onDeactivate',
      'onFinalize',
    ]);
    expect(callbacks.onUpdate).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ translationX: 20 })
    );
    expect(callbacks.onUpdate).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ translationX: 100 })
    );
  });

  test('change fields are calculated through the v3 callback pipeline', () => {
    const { callbacks } = mockedV3Callbacks();
    const pan = renderHook(() =>
      usePanGesture({ disableReanimated: true, ...callbacks })
    ).result.current;

    fireGesture(pan, {
      updates: [{ translationX: 10 }, { translationX: 100 }],
    });

    expect(callbacks.onActivate).toHaveBeenCalledWith(
      expect.objectContaining({ changeX: 0, changeY: 0 })
    );
    expect(callbacks.onUpdate).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ changeX: 10 })
    );
    expect(callbacks.onUpdate).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ changeX: 90 })
    );
  });

  test('empty updates still produce a complete successful lifecycle', () => {
    const { order, callbacks } = mockedV3Callbacks();
    const pan = renderHook(() =>
      usePanGesture({ disableReanimated: true, ...callbacks })
    ).result.current;

    fireGesture(pan);

    expect(order).toEqual([
      'onBegin',
      'onActivate',
      'onDeactivate',
      'onFinalize',
    ]);
  });

  test('cancelled pan deactivates and finalizes as cancelled', () => {
    const { order, callbacks } = mockedV3Callbacks();
    const pan = renderHook(() =>
      usePanGesture({ disableReanimated: true, ...callbacks })
    ).result.current;

    fireGesture(pan, {
      updates: [{ translationX: 20 }],
      outcome: 'cancelled',
    });

    expect(order).toEqual([
      'onBegin',
      'onActivate',
      'onUpdate',
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

  test('the end payload uses the last supplied update', () => {
    const { callbacks } = mockedV3Callbacks();
    const pan = renderHook(() =>
      usePanGesture({ disableReanimated: true, ...callbacks })
    ).result.current;

    fireGesture(pan, {
      updates: [{ translationX: 10 }, { translationX: 100 }],
    });

    expect(callbacks.onDeactivate).toHaveBeenCalledWith(
      expect.objectContaining({ translationX: 100 })
    );
  });
});

describe('fireGesture: pinch', () => {
  test('successful pinch dispatches every supplied update in order', () => {
    const { order, callbacks } = mockedV3Callbacks();
    const pinch = renderHook(() =>
      usePinchGesture({ disableReanimated: true, ...callbacks })
    ).result.current;

    fireGesture(pinch, {
      updates: [{ scale: 1.5 }, { scale: 2 }],
    });

    expect(order).toEqual([
      'onBegin',
      'onActivate',
      'onUpdate',
      'onUpdate',
      'onDeactivate',
      'onFinalize',
    ]);
    expect(callbacks.onUpdate).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ scale: 1.5 })
    );
    expect(callbacks.onUpdate).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ scale: 2 })
    );
  });

  test('scaleChange is calculated through the v3 callback pipeline', () => {
    const { callbacks } = mockedV3Callbacks();
    const pinch = renderHook(() =>
      usePinchGesture({ disableReanimated: true, ...callbacks })
    ).result.current;

    fireGesture(pinch, {
      updates: [{ scale: 2 }, { scale: 4 }],
    });

    // Activation fills the default scaleChange of 1; each update divides the
    // current scale by the previous one.
    expect(callbacks.onActivate).toHaveBeenCalledWith(
      expect.objectContaining({ scaleChange: 1 })
    );
    expect(callbacks.onUpdate).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ scaleChange: 2 })
    );
    expect(callbacks.onUpdate).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ scaleChange: 2 })
    );
  });

  test('empty updates still produce a complete successful lifecycle', () => {
    const { order, callbacks } = mockedV3Callbacks();
    const pinch = renderHook(() =>
      usePinchGesture({ disableReanimated: true, ...callbacks })
    ).result.current;

    fireGesture(pinch);

    expect(order).toEqual([
      'onBegin',
      'onActivate',
      'onDeactivate',
      'onFinalize',
    ]);
    expect(callbacks.onUpdate).not.toHaveBeenCalled();
  });

  test('event payload defaults use two pointers and identity scale', () => {
    const { callbacks } = mockedV3Callbacks();
    const pinch = renderHook(() =>
      usePinchGesture({ disableReanimated: true, ...callbacks })
    ).result.current;

    fireGesture(pinch);

    expect(callbacks.onActivate).toHaveBeenCalledWith(
      expect.objectContaining({
        numberOfPointers: 2,
        scale: 1,
        velocity: 0,
        focalX: 0,
        focalY: 0,
      })
    );
  });

  test('cancelled pinch deactivates and finalizes as cancelled', () => {
    const { order, callbacks } = mockedV3Callbacks();
    const pinch = renderHook(() =>
      usePinchGesture({ disableReanimated: true, ...callbacks })
    ).result.current;

    fireGesture(pinch, {
      updates: [{ scale: 1.5 }],
      outcome: 'cancelled',
    });

    expect(order).toEqual([
      'onBegin',
      'onActivate',
      'onUpdate',
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

  test('rejects an event payload for the continuous pinch gesture', () => {
    const pinch = renderHook(() => usePinchGesture({ disableReanimated: true }))
      .result.current;

    expect(() => fireGesture(pinch, { event: { scale: 2 } } as never)).toThrow(
      /continuous gesture/
    );
  });

  test('resolves pinch gestures by test ID string', () => {
    const { order, callbacks } = mockedV3Callbacks();
    renderHook(() =>
      usePinchGesture({
        testID: 'string-target-pinch',
        disableReanimated: true,
        ...callbacks,
      })
    );

    fireGesture('string-target-pinch', { updates: [{ scale: 3 }] });

    expect(order).toEqual([
      'onBegin',
      'onActivate',
      'onUpdate',
      'onDeactivate',
      'onFinalize',
    ]);
  });
});

describe('fireGesture: fling', () => {
  test('successful fling invokes the discrete v3 lifecycle', () => {
    const { order, callbacks } = mockedTapCallbacks();
    const fling = renderHook(() =>
      useFlingGesture({ disableReanimated: true, ...callbacks })
    ).result.current;

    fireGesture(fling);

    expect(order).toEqual([
      'onBegin',
      'onActivate',
      'onDeactivate',
      'onFinalize',
    ]);
    expect(callbacks.onDeactivate).toHaveBeenCalledWith(
      expect.objectContaining({ canceled: false })
    );
    expect(callbacks.onFinalize).toHaveBeenCalledWith(
      expect.objectContaining({ canceled: false })
    );
  });

  test('event payload defaults are stable', () => {
    const { callbacks } = mockedTapCallbacks();
    const fling = renderHook(() =>
      useFlingGesture({ disableReanimated: true, ...callbacks })
    ).result.current;

    fireGesture(fling);

    expect(callbacks.onActivate).toHaveBeenCalledWith({
      handlerTag: fling.handlerTag,
      x: 0,
      y: 0,
      absoluteX: 0,
      absoluteY: 0,
      numberOfPointers: 1,
      pointerType: expect.anything(),
    });
  });

  test('user-supplied event values reach application callbacks', () => {
    const { callbacks } = mockedTapCallbacks();
    const fling = renderHook(() =>
      useFlingGesture({ disableReanimated: true, ...callbacks })
    ).result.current;

    fireGesture(fling, { event: { x: 5, absoluteX: 5 } });

    expect(callbacks.onBegin).toHaveBeenCalledWith(
      expect.objectContaining({ x: 5, absoluteX: 5 })
    );
    expect(callbacks.onActivate).toHaveBeenCalledWith(
      expect.objectContaining({ x: 5, absoluteX: 5 })
    );
  });

  test('failed fling finalizes without activation or deactivation', () => {
    const { order, callbacks } = mockedTapCallbacks();
    const fling = renderHook(() =>
      useFlingGesture({ disableReanimated: true, ...callbacks })
    ).result.current;

    fireGesture(fling, { outcome: 'failed' });

    expect(order).toEqual(['onBegin', 'onFinalize']);
    expect(callbacks.onFinalize).toHaveBeenCalledWith(
      expect.objectContaining({ canceled: true })
    );
  });

  test('cancelled fling deactivates and finalizes as cancelled', () => {
    const { order, callbacks } = mockedTapCallbacks();
    const fling = renderHook(() =>
      useFlingGesture({ disableReanimated: true, ...callbacks })
    ).result.current;

    fireGesture(fling, { outcome: 'cancelled' });

    expect(order).toEqual([
      'onBegin',
      'onActivate',
      'onDeactivate',
      'onFinalize',
    ]);
    expect(callbacks.onDeactivate).toHaveBeenCalledWith(
      expect.objectContaining({ canceled: true })
    );
  });

  test('does not dispatch update events (fling is discrete)', () => {
    const { order } = mockedV3Callbacks();
    const onUpdate = jest.fn();
    const fling = renderHook(() =>
      useFlingGesture({
        disableReanimated: true,
        onBegin: () => order.push('onBegin'),
        onActivate: () => order.push('onActivate'),
        onDeactivate: () => order.push('onDeactivate'),
        onFinalize: () => order.push('onFinalize'),
      })
    ).result.current;

    fireGesture(fling);

    expect(order).not.toContain('onUpdate');
    expect(onUpdate).not.toHaveBeenCalled();
  });

  test('rejects updates for the discrete fling gesture', () => {
    const fling = renderHook(() => useFlingGesture({ disableReanimated: true }))
      .result.current;

    expect(() => fireGesture(fling, { updates: [{ x: 1 }] } as never)).toThrow(
      /discrete gesture and does not dispatch update events/
    );
  });

  test('resolves fling gestures by test ID string', () => {
    const { order, callbacks } = mockedTapCallbacks();
    renderHook(() =>
      useFlingGesture({
        testID: 'string-target-fling',
        disableReanimated: true,
        ...callbacks,
      })
    );

    fireGesture('string-target-fling');

    expect(order).toEqual([
      'onBegin',
      'onActivate',
      'onDeactivate',
      'onFinalize',
    ]);
  });

  test('per-stage events reach the matching callbacks', () => {
    const { callbacks } = mockedTapCallbacks();
    const fling = renderHook(() =>
      useFlingGesture({ disableReanimated: true, ...callbacks })
    ).result.current;

    fireGesture(fling, {
      stageEvents: {
        begin: { x: 0, absoluteX: 0 },
        activate: { x: 100, absoluteX: 100 },
        end: { x: 120, absoluteX: 120 },
      },
    });

    expect(callbacks.onBegin).toHaveBeenCalledWith(
      expect.objectContaining({ x: 0, absoluteX: 0 })
    );
    expect(callbacks.onActivate).toHaveBeenCalledWith(
      expect.objectContaining({ x: 100, absoluteX: 100 })
    );
    expect(callbacks.onDeactivate).toHaveBeenCalledWith(
      expect.objectContaining({ x: 120, absoluteX: 120, canceled: false })
    );
    expect(callbacks.onFinalize).toHaveBeenCalledWith(
      expect.objectContaining({ x: 120, absoluteX: 120, canceled: false })
    );
  });

  test('per-stage events override the shared `event` base', () => {
    const { callbacks } = mockedTapCallbacks();
    const fling = renderHook(() =>
      useFlingGesture({ disableReanimated: true, ...callbacks })
    ).result.current;

    fireGesture(fling, {
      event: { y: 7 },
      stageEvents: { activate: { x: 50 } },
    });

    // `event` applies to every stage; `events.activate` adds to activate only.
    expect(callbacks.onBegin).toHaveBeenCalledWith(
      expect.objectContaining({ x: 0, y: 7 })
    );
    expect(callbacks.onActivate).toHaveBeenCalledWith(
      expect.objectContaining({ x: 50, y: 7 })
    );
  });

  test('failed outcome uses the begin-stage payload for onFinalize', () => {
    const { callbacks } = mockedTapCallbacks();
    const fling = renderHook(() =>
      useFlingGesture({ disableReanimated: true, ...callbacks })
    ).result.current;

    fireGesture(fling, {
      outcome: 'failed',
      stageEvents: { begin: { x: 3 }, end: { x: 99 } },
    });

    // A failed gesture never activated, so onFinalize reports the begin data.
    expect(callbacks.onFinalize).toHaveBeenCalledWith(
      expect.objectContaining({ x: 3, canceled: true })
    );
    expect(callbacks.onActivate).not.toHaveBeenCalled();
  });
});

describe('fireGesture: targets', () => {
  test('resolves gestures by test ID string', () => {
    const { order, callbacks } = mockedV3Callbacks();
    renderHook(() =>
      usePanGesture({
        testID: 'string-target-pan',
        disableReanimated: true,
        ...callbacks,
      })
    );

    fireGesture('string-target-pan', {
      updates: [{ translationX: 50 }],
    });

    expect(order).toEqual([
      'onBegin',
      'onActivate',
      'onUpdate',
      'onDeactivate',
      'onFinalize',
    ]);
  });

  test('accepts getByGestureTestId results', () => {
    const { order, callbacks } = mockedTapCallbacks();
    renderHook(() =>
      useTapGesture({
        testID: 'queried-tap',
        disableReanimated: true,
        ...callbacks,
      })
    );

    fireGesture(getByGestureTestId('queried-tap'));

    expect(order).toEqual([
      'onBegin',
      'onActivate',
      'onDeactivate',
      'onFinalize',
    ]);
  });

  test('unknown test IDs report the requested ID', () => {
    expect(() => fireGesture('missing-gesture')).toThrow(
      "Handler with id: 'missing-gesture' cannot be found"
    );
  });

  test('disabled targets do nothing', () => {
    const { order, callbacks } = mockedV3Callbacks();
    const pan = renderHook(() =>
      usePanGesture({ disableReanimated: true, enabled: false, ...callbacks })
    ).result.current;

    fireGesture(pan);

    expect(order).toEqual([]);
  });

  test('unsupported v3 gestures produce an error listing supported kinds', () => {
    const longPress = renderHook(() =>
      useLongPressGesture({ disableReanimated: true })
    ).result.current;

    expect(() => fireGesture(longPress as never)).toThrow(
      /does not support 'LongPressGestureHandler'.*tap.*pan/
    );
  });

  test('legacy builder gestures are directed to fireGestureHandler', () => {
    const pan = Gesture.Pan();
    pan.handlerTag = 998;

    expect(() => fireGesture(pan as never)).toThrow(/fireGestureHandler/);
  });
});

describe('fireGesture: scenario validation', () => {
  test('rejects updates for discrete gestures', () => {
    const tap = renderHook(() => useTapGesture({ disableReanimated: true }))
      .result.current;

    expect(() => fireGesture(tap, { updates: [{ x: 1 }] } as never)).toThrow(
      /discrete gesture and does not dispatch update events/
    );
  });

  test('rejects an event payload for continuous gestures', () => {
    const pan = renderHook(() => usePanGesture({ disableReanimated: true }))
      .result.current;

    expect(() => fireGesture(pan, { event: { x: 1 } } as never)).toThrow(
      /continuous gesture/
    );
  });

  test('rejects native state-machine fields in payloads', () => {
    const pan = renderHook(() => usePanGesture({ disableReanimated: true }))
      .result.current;

    expect(() =>
      fireGesture(pan, { updates: [{ state: 4 }] } as never)
    ).toThrow(/'state'/);
  });

  test('rejects unknown outcomes', () => {
    const pan = renderHook(() => usePanGesture({ disableReanimated: true }))
      .result.current;

    expect(() => fireGesture(pan, { outcome: 'finished' } as never)).toThrow(
      /unknown outcome: 'finished'/
    );
  });
});

describe('fireGesture: arbitration core integration', () => {
  test('every state change passes through the shared arbitration core', () => {
    const onHandlerStateChange = jest.spyOn(
      GestureArbitrator.prototype,
      'onHandlerStateChange'
    );

    const { order, callbacks } = mockedV3Callbacks();
    const pan = renderHook(() =>
      usePanGesture({ disableReanimated: true, ...callbacks })
    ).result.current;

    fireGesture(pan, { updates: [{ translationX: 5 }] });

    // begin, activate and end are all requested through the core.
    expect(onHandlerStateChange).toHaveBeenCalledTimes(3);
    expect(order).toEqual([
      'onBegin',
      'onActivate',
      'onUpdate',
      'onDeactivate',
      'onFinalize',
    ]);

    onHandlerStateChange.mockRestore();
  });
});

describe('fireGesture: application behavior', () => {
  test('gesture callbacks drive rendered output', () => {
    function DraggableValue() {
      const [x, setX] = useState(0);
      const pan = usePanGesture({
        testID: 'drag',
        disableReanimated: true,
        onUpdate: (event) => setX(event.translationX),
      });

      return (
        <GestureHandlerRootView>
          <GestureDetector gesture={pan}>
            <View />
          </GestureDetector>
          <Text>{x}</Text>
        </GestureHandlerRootView>
      );
    }

    render(<DraggableValue />);

    fireGesture('drag', {
      updates: [{ translationX: 10 }, { translationX: 100 }],
    });

    expect(screen.getByText('100')).toBeTruthy();
  });
});

// Compile-time only checks — never executed. Verified by `yarn ts-check`:
// an incorrectly accepted scenario surfaces as an unused '@ts-expect-error'.
function _fireGestureTypeChecks(pan: PanGesture, tap: TapGesture) {
  // Directly returned hook gestures infer their scenario payload types
  // without a gesture-name argument.
  fireGesture(pan, { updates: [{ translationX: 1, velocityX: 2 }] });
  fireGesture(pan, { updates: [], outcome: 'cancelled' });
  fireGesture(tap, { event: { x: 1 }, outcome: 'failed' });

  // @ts-expect-error tap event payloads are not valid pan scenarios
  fireGesture(pan, { event: { x: 1 } });
  // @ts-expect-error pan updates are not valid tap scenarios
  fireGesture(tap, { updates: [{ translationX: 1 }] });
  // @ts-expect-error scenario payloads never accept native state fields
  fireGesture(pan, { updates: [{ state: 4 }] });
  // @ts-expect-error scenario payloads never accept handler tags
  fireGesture(tap, { event: { handlerTag: 1 } });
  // @ts-expect-error outcomes are limited to success/failed/cancelled
  fireGesture(pan, { outcome: 'finished' });

  // Queried gestures accept the union of supported scenarios without
  // requiring a gesture-name argument.
  fireGesture('any-test-id', { updates: [{ translationX: 1 }] });
  fireGesture('any-test-id', { event: { x: 1 } });
  fireGesture('any-test-id', { outcome: 'cancelled' });
}
void _fireGestureTypeChecks;

describe('fireGesture: coexistence with fireGestureHandler', () => {
  test('the low-level API keeps working for the same gesture', () => {
    const { order, callbacks } = mockedV3Callbacks();
    const pan = renderHook(() =>
      usePanGesture({ disableReanimated: true, ...callbacks })
    ).result.current;

    fireGesture(pan);
    fireGestureHandler(pan, []);

    expect(order.filter((entry) => entry === 'onBegin')).toHaveLength(2);
  });
});
