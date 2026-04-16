import { render, renderHook } from '@testing-library/react-native';
import { act } from 'react';

import GestureHandlerRootView from '../components/GestureHandlerRootView';
import { fireGestureHandler, getByGestureTestId } from '../jestUtils';
import { State } from '../State';
import { RectButton, Touchable } from '../v3/components';
import { usePanGesture } from '../v3/hooks/gestures';
import type { SingleGesture } from '../v3/types';

describe('[API v3] Hooks', () => {
  test('Pan gesture', () => {
    const onBegin = jest.fn();
    const onStart = jest.fn();

    const panGesture = renderHook(() =>
      usePanGesture({
        disableReanimated: true,
        onBegin: (e) => onBegin(e),
        onActivate: (e) => onStart(e),
      })
    ).result.current;

    fireGestureHandler(panGesture, [
      { oldState: State.UNDETERMINED, state: State.BEGAN },
      { oldState: State.BEGAN, state: State.ACTIVE },
      { oldState: State.ACTIVE, state: State.ACTIVE },
      { oldState: State.ACTIVE, state: State.END },
    ]);

    expect(onBegin).toHaveBeenCalledTimes(1);
    expect(onStart).toHaveBeenCalledTimes(1);
  });
});

describe('[API v3] Components', () => {
  test('Rect Button', () => {
    const pressFn = jest.fn();

    const RectButtonExample = () => {
      return (
        <GestureHandlerRootView>
          <RectButton testID="btn" onPress={pressFn} />
        </GestureHandlerRootView>
      );
    };

    render(<RectButtonExample />);

    const nativeGesture = getByGestureTestId('btn');

    act(() => {
      fireGestureHandler(nativeGesture, [
        { oldState: State.UNDETERMINED, state: State.BEGAN },
        { oldState: State.BEGAN, state: State.ACTIVE },
        { oldState: State.ACTIVE, state: State.END },
      ]);
    });

    expect(pressFn).toHaveBeenCalledTimes(1);
  });

  describe('Touchable', () => {
    test('calls onPress on successful press', () => {
      const pressFn = jest.fn();

      const Example = () => (
        <GestureHandlerRootView>
          <Touchable testID="touchable" onPress={pressFn} />
        </GestureHandlerRootView>
      );

      render(<Example />);
      const gesture = getByGestureTestId('touchable');

      act(() => {
        fireGestureHandler(gesture, [
          { oldState: State.UNDETERMINED, state: State.BEGAN },
          { oldState: State.BEGAN, state: State.ACTIVE },
          { oldState: State.ACTIVE, state: State.END },
        ]);
      });

      expect(pressFn).toHaveBeenCalledTimes(1);
    });

    test('does not call onPress on cancelled gesture', () => {
      const pressFn = jest.fn();

      const Example = () => (
        <GestureHandlerRootView>
          <Touchable testID="touchable" onPress={pressFn} />
        </GestureHandlerRootView>
      );

      render(<Example />);
      const gesture = getByGestureTestId('touchable');

      act(() => {
        fireGestureHandler(gesture, [
          { oldState: State.UNDETERMINED, state: State.BEGAN },
          { oldState: State.BEGAN, state: State.ACTIVE },
          { oldState: State.ACTIVE, state: State.FAILED },
        ]);
      });

      expect(pressFn).not.toHaveBeenCalled();
    });

    test('calls onActiveStateChange with correct values', () => {
      const activeStateFn = jest.fn();

      const Example = () => (
        <GestureHandlerRootView>
          <Touchable testID="touchable" onActiveStateChange={activeStateFn} />
        </GestureHandlerRootView>
      );

      render(<Example />);
      const gesture = getByGestureTestId('touchable');

      act(() => {
        fireGestureHandler(gesture, [
          { oldState: State.UNDETERMINED, state: State.BEGAN },
          { oldState: State.BEGAN, state: State.ACTIVE },
          { oldState: State.ACTIVE, state: State.END },
        ]);
      });

      expect(activeStateFn).toHaveBeenCalledTimes(2);
      expect(activeStateFn).toHaveBeenNthCalledWith(1, true);
      expect(activeStateFn).toHaveBeenNthCalledWith(2, false);
    });

    test('calls onLongPress after delayLongPress and suppresses onPress', () => {
      jest.useFakeTimers();

      const pressFn = jest.fn();
      const longPressFn = jest.fn();
      const DELAY = 800;

      const Example = () => (
        <GestureHandlerRootView>
          <Touchable
            testID="touchable"
            onPress={pressFn}
            onLongPress={longPressFn}
            delayLongPress={DELAY}
          />
        </GestureHandlerRootView>
      );

      render(<Example />);

      const gesture = getByGestureTestId('touchable') as SingleGesture<
        any,
        any,
        any
      >;
      const { jsEventHandler } = gesture.detectorCallbacks;

      // Fire BEGAN
      act(() => {
        jsEventHandler?.({
          oldState: State.UNDETERMINED,
          state: State.BEGAN,
          handlerTag: gesture.handlerTag,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          handlerData: { pointerInside: true, numberOfPointers: 1 } as any,
        });
      });

      // Fire ACTIVE — long press timer starts here (on iOS / non-Android)
      act(() => {
        jsEventHandler?.({
          oldState: State.BEGAN,
          state: State.ACTIVE,
          handlerTag: gesture.handlerTag,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          handlerData: { pointerInside: true, numberOfPointers: 1 } as any,
        });
      });

      expect(longPressFn).not.toHaveBeenCalled();

      // Advance fake timers past delayLongPress
      act(() => {
        jest.advanceTimersByTime(DELAY);
      });

      expect(longPressFn).toHaveBeenCalledTimes(1);
      expect(pressFn).not.toHaveBeenCalled();

      // Fire END — onPress should be suppressed because long press was detected
      act(() => {
        jsEventHandler?.({
          oldState: State.ACTIVE,
          state: State.END,
          handlerTag: gesture.handlerTag,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          handlerData: { pointerInside: true, numberOfPointers: 1 } as any,
        });
      });

      expect(pressFn).not.toHaveBeenCalled();

      jest.useRealTimers();
    });
  });
});
