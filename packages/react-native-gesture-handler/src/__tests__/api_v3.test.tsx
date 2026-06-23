import { render, renderHook } from '@testing-library/react-native';
import { act } from 'react';
import { View } from 'react-native';

import GestureHandlerRootView from '../components/GestureHandlerRootView';
import { fireGestureHandler, getByGestureTestId } from '../jestUtils';
import { State } from '../State';
import { Pressable, RectButton, ScrollView, Touchable } from '../v3/components';
import { GestureDetector } from '../v3/detectors';
import { useSimultaneousGestures } from '../v3/hooks';
import { usePanGesture, useTapGesture } from '../v3/hooks/gestures';
import type { SingleGesture } from '../v3/types';

const flushImmediate = () =>
  new Promise((resolve) => {
    setImmediate(() => resolve(undefined));
  });

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
  const getScrollViewResponder = (
    views: ReturnType<typeof render>['UNSAFE_getAllByType']
  ) => {
    return views(View).find(
      ({ props }) =>
        props.collapsable === false &&
        props.onStartShouldSetResponderCapture &&
        props.onStartShouldSetResponder
    );
  };

  const getNativeDetector = (
    views: ReturnType<typeof render>['UNSAFE_getAllByType']
  ) => {
    return views(View).find(
      ({ props }) => props.handlerTags && props.onStartShouldSetResponder
    );
  };

  const TapGestureDetectorExample = () => {
    const tap = useTapGesture({ disableReanimated: true });

    return (
      <GestureDetector gesture={tap}>
        <View />
      </GestureDetector>
    );
  };

  const PanGestureDetectorExample = () => {
    const pan = usePanGesture({ disableReanimated: true });

    return (
      <GestureDetector gesture={pan}>
        <View />
      </GestureDetector>
    );
  };

  const SimultaneousGestureDetectorExample = () => {
    const tap = useTapGesture({ disableReanimated: true });
    const pan = usePanGesture({ disableReanimated: true });
    const simultaneous = useSimultaneousGestures(tap, pan);

    return (
      <GestureDetector gesture={simultaneous}>
        <View />
      </GestureDetector>
    );
  };

  const DisabledSimultaneousGestureDetectorExample = () => {
    const tap = useTapGesture({ disableReanimated: true, enabled: false });
    const pan = usePanGesture({ disableReanimated: true, enabled: false });
    const simultaneous = useSimultaneousGestures(tap, pan);

    return (
      <GestureDetector gesture={simultaneous}>
        <View />
      </GestureDetector>
    );
  };

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

  describe('ScrollView', () => {
    test('handles responder event passed through Pressable for keyboardShouldPersistTaps handled', async () => {
      const { UNSAFE_getAllByType } = render(
        <GestureHandlerRootView>
          <ScrollView keyboardShouldPersistTaps="handled">
            <Pressable testID="pressable" />
          </ScrollView>
        </GestureHandlerRootView>
      );

      await act(flushImmediate);

      const nativeDetector = getNativeDetector(UNSAFE_getAllByType);
      const scrollViewResponder = getScrollViewResponder(UNSAFE_getAllByType);

      expect(scrollViewResponder).toBeDefined();
      expect(
        scrollViewResponder?.props.onStartShouldSetResponderCapture()
      ).toBe(false);
      expect(nativeDetector?.props.onStartShouldSetResponder()).toBe(false);
      expect(scrollViewResponder?.props.onStartShouldSetResponder()).toBe(true);
      expect(scrollViewResponder?.props.onStartShouldSetResponder()).toBe(
        false
      );
    });

    test('does not handle responder event passed through Pressable without keyboardShouldPersistTaps handled', async () => {
      const { UNSAFE_getAllByType } = render(
        <GestureHandlerRootView>
          <ScrollView>
            <Pressable testID="pressable" />
          </ScrollView>
        </GestureHandlerRootView>
      );

      await act(flushImmediate);

      const nativeDetector = getNativeDetector(UNSAFE_getAllByType);
      const scrollViewResponder = getScrollViewResponder(UNSAFE_getAllByType);

      expect(scrollViewResponder).toBeDefined();
      expect(
        scrollViewResponder?.props.onStartShouldSetResponderCapture()
      ).toBe(false);
      expect(nativeDetector?.props.onStartShouldSetResponder()).toBe(false);
      expect(scrollViewResponder?.props.onStartShouldSetResponder()).toBe(
        false
      );
    });

    test('handles responder event passed through NativeDetector for keyboardShouldPersistTaps handled', async () => {
      const { UNSAFE_getAllByType } = render(
        <GestureHandlerRootView>
          <ScrollView keyboardShouldPersistTaps="handled">
            <TapGestureDetectorExample />
          </ScrollView>
        </GestureHandlerRootView>
      );

      await act(flushImmediate);

      const nativeDetector = getNativeDetector(UNSAFE_getAllByType);
      const scrollViewResponder = getScrollViewResponder(UNSAFE_getAllByType);

      expect(nativeDetector).toBeDefined();
      expect(scrollViewResponder).toBeDefined();
      expect(
        scrollViewResponder?.props.onStartShouldSetResponderCapture()
      ).toBe(false);
      expect(nativeDetector?.props.onStartShouldSetResponder()).toBe(false);
      expect(scrollViewResponder?.props.onStartShouldSetResponder()).toBe(true);
    });

    test('does not handle responder event passed through NativeDetector for unsupported gestures', async () => {
      const { UNSAFE_getAllByType } = render(
        <GestureHandlerRootView>
          <ScrollView keyboardShouldPersistTaps="handled">
            <PanGestureDetectorExample />
          </ScrollView>
        </GestureHandlerRootView>
      );

      await act(flushImmediate);

      const nativeDetector = getNativeDetector(UNSAFE_getAllByType);
      const scrollViewResponder = getScrollViewResponder(UNSAFE_getAllByType);

      expect(nativeDetector).toBeDefined();
      expect(scrollViewResponder).toBeDefined();
      expect(
        scrollViewResponder?.props.onStartShouldSetResponderCapture()
      ).toBe(false);
      expect(nativeDetector?.props.onStartShouldSetResponder()).toBe(false);
      expect(scrollViewResponder?.props.onStartShouldSetResponder()).toBe(
        false
      );
    });

    test('handles responder event passed through NativeDetector for composed gestures', async () => {
      const { UNSAFE_getAllByType } = render(
        <GestureHandlerRootView>
          <ScrollView keyboardShouldPersistTaps="handled">
            <SimultaneousGestureDetectorExample />
          </ScrollView>
        </GestureHandlerRootView>
      );

      await act(flushImmediate);

      const nativeDetector = getNativeDetector(UNSAFE_getAllByType);
      const scrollViewResponder = getScrollViewResponder(UNSAFE_getAllByType);

      expect(nativeDetector).toBeDefined();
      expect(scrollViewResponder).toBeDefined();
      expect(
        scrollViewResponder?.props.onStartShouldSetResponderCapture()
      ).toBe(false);
      expect(nativeDetector?.props.onStartShouldSetResponder()).toBe(false);
      expect(scrollViewResponder?.props.onStartShouldSetResponder()).toBe(true);
    });

    test('does not handle responder event passed through NativeDetector for disabled composed gestures', async () => {
      const { UNSAFE_getAllByType } = render(
        <GestureHandlerRootView>
          <ScrollView keyboardShouldPersistTaps="handled">
            <DisabledSimultaneousGestureDetectorExample />
          </ScrollView>
        </GestureHandlerRootView>
      );

      await act(flushImmediate);

      const nativeDetector = getNativeDetector(UNSAFE_getAllByType);
      const scrollViewResponder = getScrollViewResponder(UNSAFE_getAllByType);

      expect(nativeDetector).toBeDefined();
      expect(scrollViewResponder).toBeDefined();
      expect(
        scrollViewResponder?.props.onStartShouldSetResponderCapture()
      ).toBe(false);
      expect(nativeDetector?.props.onStartShouldSetResponder()).toBe(false);
      expect(scrollViewResponder?.props.onStartShouldSetResponder()).toBe(
        false
      );
    });
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
