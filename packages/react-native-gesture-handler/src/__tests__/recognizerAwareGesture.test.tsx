import { render, renderHook } from '@testing-library/react-native';
import React from 'react';
import { Text, View } from 'react-native';
import type { ReactTestInstance } from 'react-test-renderer';

import GestureHandlerRootView from '../components/GestureHandlerRootView';
import { simulatePointerGesture } from '../jestUtils';
import { GestureDetector } from '../v3/detectors';
import { useSimultaneousGestures } from '../v3/hooks';
import {
  useFlingGesture,
  useLongPressGesture,
  usePanGesture,
  usePinchGesture,
  useRotationGesture,
  useTapGesture,
} from '../v3/hooks/gestures';

describe('recognizer-aware Jest gesture simulation', () => {
  function getNativeDetector(
    views: ReturnType<typeof render>['UNSAFE_getAllByType']
  ): ReactTestInstance {
    const detector = views(View).find(({ props }) => props.handlerTags);

    if (!detector) {
      throw new Error(
        'Expected rendered test tree to include a detector host.'
      );
    }

    return detector;
  }

  test('pan activates when pointer movement crosses activation threshold', () => {
    const onBegin = jest.fn();
    const onActivate = jest.fn();
    const onUpdate = jest.fn();
    const onDeactivate = jest.fn();

    const panGesture = renderHook(() =>
      usePanGesture({
        disableReanimated: true,
        onBegin,
        onActivate,
        onUpdate,
        onDeactivate,
      })
    ).result.current;

    simulatePointerGesture({ on: panGesture, x: 50, steps: 2 });

    expect(onBegin).toHaveBeenCalledTimes(1);
    expect(onActivate).toHaveBeenCalledWith(
      expect.objectContaining({ translationX: 0, translationY: 0 })
    );
    expect(onUpdate).toHaveBeenCalled();
    expect(onUpdate).toHaveBeenLastCalledWith(
      expect.objectContaining({ translationX: 25, translationY: 0 })
    );
    expect(onDeactivate).toHaveBeenCalledWith(
      expect.objectContaining({ translationX: 25, canceled: false })
    );
  });

  test('pan fails when pointer movement does not cross activation threshold', () => {
    const onActivate = jest.fn();
    const onUpdate = jest.fn();
    const onFinalize = jest.fn();

    const panGesture = renderHook(() =>
      usePanGesture({
        disableReanimated: true,
        onActivate,
        onUpdate,
        onFinalize,
      })
    ).result.current;

    simulatePointerGesture({ on: panGesture, x: 1 });

    expect(onActivate).not.toHaveBeenCalled();
    expect(onUpdate).not.toHaveBeenCalled();
    expect(onFinalize).toHaveBeenCalledWith(
      expect.objectContaining({ canceled: true })
    );
  });

  test('tap succeeds when pointer stays inside movement constraints', () => {
    const onBegin = jest.fn();
    const onActivate = jest.fn();
    const onFinalize = jest.fn();

    const tapGesture = renderHook(() =>
      useTapGesture({
        disableReanimated: true,
        maxDistance: 10,
        onBegin,
        onActivate,
        onFinalize,
      })
    ).result.current;

    simulatePointerGesture({ on: tapGesture });

    expect(onBegin).toHaveBeenCalledTimes(1);
    expect(onActivate).toHaveBeenCalledTimes(1);
    expect(onFinalize).toHaveBeenCalledWith(
      expect.objectContaining({ canceled: false })
    );
  });

  test('tap fails when pointer movement exceeds max distance', () => {
    const onActivate = jest.fn();
    const onFinalize = jest.fn();

    const tapGesture = renderHook(() =>
      useTapGesture({
        disableReanimated: true,
        maxDistance: 10,
        onActivate,
        onFinalize,
      })
    ).result.current;

    simulatePointerGesture({ on: tapGesture, x: 50 });

    expect(onActivate).not.toHaveBeenCalled();
    expect(onFinalize).toHaveBeenCalledWith(
      expect.objectContaining({ canceled: true })
    );
  });

  test('tap fails when held past max duration', () => {
    jest.useFakeTimers();

    try {
      const onActivate = jest.fn();
      const onFinalize = jest.fn();

      const tapGesture = renderHook(() =>
        useTapGesture({
          disableReanimated: true,
          maxDuration: 100,
          onActivate,
          onFinalize,
        })
      ).result.current;

      simulatePointerGesture({ on: tapGesture, holdForMs: 101 });

      expect(onActivate).not.toHaveBeenCalled();
      expect(onFinalize).toHaveBeenCalledWith(
        expect.objectContaining({ canceled: true })
      );
    } finally {
      jest.useRealTimers();
    }
  });

  test('long press activates after hold duration', () => {
    jest.useFakeTimers();

    try {
      const onActivate = jest.fn();
      const onFinalize = jest.fn();

      const longPressGesture = renderHook(() =>
        useLongPressGesture({
          disableReanimated: true,
          minDuration: 500,
          onActivate,
          onFinalize,
        })
      ).result.current;

      simulatePointerGesture({ on: longPressGesture, holdForMs: 500 });

      expect(onActivate).toHaveBeenCalledTimes(1);
      expect(onFinalize).toHaveBeenCalledWith(
        expect.objectContaining({ canceled: false })
      );
    } finally {
      jest.useRealTimers();
    }
  });

  test('fling activates from a fast pointer path', () => {
    const onActivate = jest.fn();
    const onFinalize = jest.fn();

    const flingGesture = renderHook(() =>
      useFlingGesture({
        disableReanimated: true,
        onActivate,
        onFinalize,
      })
    ).result.current;

    simulatePointerGesture({
      on: flingGesture,
      x: 120,
      steps: 3,
      timeStepMs: 10,
    });

    expect(onActivate).toHaveBeenCalledTimes(1);
    expect(onFinalize).toHaveBeenCalledWith(
      expect.objectContaining({ canceled: false })
    );
  });

  test('disabled gesture emits nothing', () => {
    const onBegin = jest.fn();

    const panGesture = renderHook(() =>
      usePanGesture({
        disableReanimated: true,
        enabled: false,
        onBegin,
      })
    ).result.current;

    simulatePointerGesture({ on: panGesture, x: 50 });

    expect(onBegin).not.toHaveBeenCalled();
  });

  test('string targets resolve through gesture test IDs', () => {
    const onUpdate = jest.fn();

    function Example() {
      const panGesture = usePanGesture({
        testID: 'draggable',
        disableReanimated: true,
        onUpdate,
      });

      return (
        <GestureHandlerRootView>
          <GestureDetector gesture={panGesture}>
            <Text>drag me</Text>
          </GestureDetector>
        </GestureHandlerRootView>
      );
    }

    render(<Example />);

    simulatePointerGesture({ on: 'draggable', x: 50, steps: 2 });

    expect(onUpdate).toHaveBeenLastCalledWith(
      expect.objectContaining({ translationX: 25 })
    );
  });

  test('detector host targets stream to every attached recognizer', () => {
    const onPanUpdate = jest.fn();
    const onTapActivate = jest.fn();
    const onTapFinalize = jest.fn();

    function Example() {
      const tapGesture = useTapGesture({
        disableReanimated: true,
        maxDistance: 10,
        onActivate: onTapActivate,
        onFinalize: onTapFinalize,
      });
      const panGesture = usePanGesture({
        disableReanimated: true,
        onUpdate: onPanUpdate,
      });
      const gesture = useSimultaneousGestures(tapGesture, panGesture);

      return (
        <GestureHandlerRootView>
          <GestureDetector gesture={gesture}>
            <Text>drag me</Text>
          </GestureDetector>
        </GestureHandlerRootView>
      );
    }

    const { UNSAFE_getAllByType } = render(<Example />);
    const detector = getNativeDetector(UNSAFE_getAllByType);

    simulatePointerGesture({ on: detector, x: 50, steps: 2 });

    expect(onPanUpdate).toHaveBeenCalled();
    expect(onTapActivate).not.toHaveBeenCalled();
    expect(onTapFinalize).toHaveBeenCalledWith(
      expect.objectContaining({ canceled: true })
    );
  });

  test('detector host targets preserve simultaneous relations', () => {
    const firstTapActivate = jest.fn();
    const secondTapActivate = jest.fn();

    function Example() {
      const firstTap = useTapGesture({
        disableReanimated: true,
        onActivate: firstTapActivate,
      });
      const secondTap = useTapGesture({
        disableReanimated: true,
        onActivate: secondTapActivate,
      });
      const gesture = useSimultaneousGestures(firstTap, secondTap);

      return (
        <GestureHandlerRootView>
          <GestureDetector gesture={gesture}>
            <Text>tap me</Text>
          </GestureDetector>
        </GestureHandlerRootView>
      );
    }

    const { UNSAFE_getAllByType } = render(<Example />);
    const detector = getNativeDetector(UNSAFE_getAllByType);

    simulatePointerGesture({ on: detector });

    expect(firstTapActivate).toHaveBeenCalledTimes(1);
    expect(secondTapActivate).toHaveBeenCalledTimes(1);
  });

  test('pinch activates from a two-pointer path', () => {
    const onActivate = jest.fn();
    const onUpdate = jest.fn<void, [{ scale?: unknown }]>();
    const onFinalize = jest.fn();

    const pinchGesture = renderHook(() =>
      usePinchGesture({
        disableReanimated: true,
        onActivate,
        onUpdate,
        onFinalize,
      })
    ).result.current;

    simulatePointerGesture({
      on: pinchGesture,
      pointers: [
        {
          path: [
            { x: 45, y: 50 },
            { x: 30, y: 50 },
            { x: 15, y: 50 },
          ],
        },
        {
          path: [
            { x: 55, y: 50 },
            { x: 70, y: 50 },
            { x: 85, y: 50 },
          ],
        },
      ],
    });

    expect(onActivate).toHaveBeenCalledTimes(1);
    const update = onUpdate.mock.calls.at(-1)?.[0] as
      | { scale?: unknown }
      | undefined;
    expect(typeof update?.scale).toBe('number');
    expect(onFinalize).toHaveBeenCalledWith(
      expect.objectContaining({ canceled: false })
    );
  });

  test('rotation activates from a two-pointer path', () => {
    const onActivate = jest.fn();
    const onUpdate = jest.fn<void, [{ rotation?: unknown }]>();
    const onFinalize = jest.fn();

    const rotationGesture = renderHook(() =>
      useRotationGesture({
        disableReanimated: true,
        onActivate,
        onUpdate,
        onFinalize,
      })
    ).result.current;

    simulatePointerGesture({
      on: rotationGesture,
      pointers: [
        {
          path: [
            { x: 40, y: 50 },
            { x: 50, y: 35 },
          ],
        },
        {
          path: [
            { x: 60, y: 50 },
            { x: 50, y: 65 },
          ],
        },
      ],
    });

    expect(onActivate).toHaveBeenCalledTimes(1);
    const update = onUpdate.mock.calls.at(-1)?.[0] as
      | { rotation?: unknown }
      | undefined;
    expect(typeof update?.rotation).toBe('number');
    expect(onFinalize).toHaveBeenCalledWith(
      expect.objectContaining({ canceled: false })
    );
  });

  test('child view targets resolve to the nearest detector host', () => {
    const onUpdate = jest.fn();

    function Example() {
      const panGesture = usePanGesture({
        disableReanimated: true,
        onUpdate,
      });

      return (
        <GestureHandlerRootView>
          <GestureDetector gesture={panGesture}>
            <View testID="draggable-child" />
          </GestureDetector>
        </GestureHandlerRootView>
      );
    }

    const { getByTestId } = render(<Example />);

    simulatePointerGesture({
      on: getByTestId('draggable-child'),
      x: 50,
      steps: 2,
    });

    expect(onUpdate).toHaveBeenLastCalledWith(
      expect.objectContaining({ translationX: 25 })
    );
  });

  test('child view targets prefer the nearest nested detector host', () => {
    const onOuterUpdate = jest.fn();
    const onInnerTapActivate = jest.fn();
    const onInnerTapFinalize = jest.fn();

    function Example() {
      const outerPan = usePanGesture({
        disableReanimated: true,
        onUpdate: onOuterUpdate,
      });
      const innerTap = useTapGesture({
        disableReanimated: true,
        maxDistance: 10,
        onActivate: onInnerTapActivate,
        onFinalize: onInnerTapFinalize,
      });

      return (
        <GestureHandlerRootView>
          <GestureDetector gesture={outerPan}>
            <View>
              <GestureDetector gesture={innerTap}>
                <View testID="nested-child" />
              </GestureDetector>
            </View>
          </GestureDetector>
        </GestureHandlerRootView>
      );
    }

    const { getByTestId } = render(<Example />);

    simulatePointerGesture({ on: getByTestId('nested-child'), x: 50 });

    expect(onOuterUpdate).not.toHaveBeenCalled();
    expect(onInnerTapActivate).not.toHaveBeenCalled();
    expect(onInnerTapFinalize).toHaveBeenCalledWith(
      expect.objectContaining({ canceled: true })
    );
  });

  test('unsupported recognizer targets throw a useful error', () => {
    expect(() => simulatePointerGesture({ on: {} as never, x: 50 })).toThrow(
      'simulatePointerGesture() supports only API v3 hook gestures, gesture test IDs, or rendered detector targets.'
    );
  });
});
