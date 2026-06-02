import { render, renderHook } from '@testing-library/react-native';
import { act, createRef } from 'react';
import type { View } from 'react-native';

import GestureHandlerRootView from '../components/GestureHandlerRootView';
import { fireGestureHandler, getByGestureTestId } from '../jestUtils';
import { State } from '../State';
import { Pressable, RectButton, Touchable } from '../v3/components';
import { usePanGesture } from '../v3/hooks/gestures';
import type { SingleGesture } from '../v3/types';

type AnimatableViewRef = View & {
  getAnimatableRef?: () => View | null;
};

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
  test('Pressable exposes the native button as an animatable ref', () => {
    const ref = createRef<AnimatableViewRef>();

    render(
      <GestureHandlerRootView>
        <Pressable ref={ref} />
      </GestureHandlerRootView>
    );

    expect(ref.current?.getAnimatableRef?.()).toBe(ref.current);
  });

  test('Pressable forwards function refs on mount and unmount', () => {
    const ref = jest.fn();

    const { unmount } = render(
      <GestureHandlerRootView>
        <Pressable ref={ref} />
      </GestureHandlerRootView>
    );

    expect(ref).toHaveBeenCalledWith(expect.anything());

    unmount();

    expect(ref).toHaveBeenLastCalledWith(null);
  });

  test('Pressable animatable refs stay bound to their host instance', () => {
    const ref = createRef<AnimatableViewRef>();
    const renderPressable = (key: string) => (
      <GestureHandlerRootView>
        <Pressable key={key} ref={ref} />
      </GestureHandlerRootView>
    );
    const { rerender } = render(renderPressable('first'));
    const firstRef = ref.current;

    rerender(renderPressable('second'));
    const secondRef = ref.current;

    expect(firstRef?.getAnimatableRef?.()).toBe(firstRef);
    expect(secondRef?.getAnimatableRef?.()).toBe(secondRef);
  });

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
    test('exposes the native button as an animatable ref', () => {
      const ref = createRef<AnimatableViewRef>();

      render(
        <GestureHandlerRootView>
          <Touchable ref={ref} />
        </GestureHandlerRootView>
      );

      expect(ref.current?.getAnimatableRef?.()).toBe(ref.current);
    });

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

      // Fire BEGAN — long press timer starts here
      act(() => {
        jsEventHandler?.({
          oldState: State.UNDETERMINED,
          state: State.BEGAN,
          handlerTag: gesture.handlerTag,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          handlerData: { pointerInside: true, numberOfPointers: 1 } as any,
        });
      });

      // Fire ACTIVE
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
