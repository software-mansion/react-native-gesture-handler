import {
  fireEvent,
  render,
  renderHook,
  screen,
} from '@testing-library/react-native';
import { act } from 'react';
import { Keyboard, View } from 'react-native';

import GestureHandlerRootView from '../components/GestureHandlerRootView';
import { fireGestureHandler, getByGestureTestId } from '../jestUtils';
import { State } from '../State';
import { Pressable, RectButton, ScrollView, Touchable } from '../v3/components';
import {
  isKeyboardDismissingTap,
  type JSResponderContextValue,
} from '../v3/components/ScrollViewResponderInterceptor';
import { GestureDetector } from '../v3/detectors';
import { useSimultaneousGestures } from '../v3/hooks';
import { usePanGesture, useTapGesture } from '../v3/hooks/gestures';

const flushImmediate = () =>
  new Promise((resolve) => {
    setImmediate(() => resolve(undefined));
  });

// The Touchable press state machine runs on the native side — the JS layer
// receives the resulting press events directly from the button.
const buttonEvent = (pointerInside = true) => ({
  nativeEvent: {
    pointerInside,
    x: 0,
    y: 0,
    absoluteX: 0,
    absoluteY: 0,
    numberOfPointers: 1,
    pointerType: 0,
  },
});

// Mirrors the event sequence the native side dispatches for a successful tap.
const fireNativeTap = (testID: string) => {
  const button = screen.getByTestId(testID);
  fireEvent(button, 'buttonPressIn', buttonEvent());
  fireEvent(button, 'buttonPressOut', buttonEvent());
  fireEvent(button, 'buttonPress', buttonEvent());
  fireEvent(button, 'buttonInteractionFinished', buttonEvent());
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

  test('Pan gesture drops malformed event without crashing', () => {
    // On Android a touch event may be serialized without the `allTouches` key
    // when its payload is lost in a race (e.g. rapid taps cancelling the
    // gesture). Such an event has no `oldState`, no `allTouches` and no
    // `handlerData`, so it used to be misclassified as an update event and
    // crash the pan change calculator with
    // "Cannot read property 'translationX' of undefined".
    const onUpdate = jest.fn();
    const onTouchesUp = jest.fn();

    const panGesture = renderHook(() =>
      usePanGesture({
        disableReanimated: true,
        onUpdate: (e) => onUpdate(e),
        onTouchesUp: (e) => onTouchesUp(e),
      })
    ).result.current;

    const { jsEventHandler } = panGesture.detectorCallbacks;

    const malformedTouchEvent = {
      handlerTag: panGesture.handlerTag,
      state: State.ACTIVE,
      eventType: 3, // TouchEventType.TOUCHES_UP
      numberOfTouches: 0,
      changedTouches: [{ id: 0, x: 0, y: 0, absoluteX: 0, absoluteY: 0 }],
      // no `allTouches`, no `oldState`, no `handlerData`
    };

    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jsEventHandler?.(malformedTouchEvent as any);
    }).not.toThrow();

    expect(onUpdate).not.toHaveBeenCalled();
    expect(onTouchesUp).not.toHaveBeenCalled();
  });

  test('Pan gesture handles valid update events after a malformed one', () => {
    const onUpdate = jest.fn();

    const panGesture = renderHook(() =>
      usePanGesture({
        disableReanimated: true,
        onUpdate: (e) => onUpdate(e),
      })
    ).result.current;

    const { jsEventHandler } = panGesture.detectorCallbacks;

    jsEventHandler?.({
      handlerTag: panGesture.handlerTag,
      state: State.ACTIVE,
      eventType: 3,
      numberOfTouches: 0,
      changedTouches: [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    jsEventHandler?.({
      handlerTag: panGesture.handlerTag,
      state: State.ACTIVE,
      handlerData: {
        translationX: 10,
        translationY: 5,
        x: 10,
        y: 5,
        absoluteX: 10,
        absoluteY: 5,
        velocityX: 0,
        velocityY: 0,
        stylusData: undefined,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    });

    expect(onUpdate).toHaveBeenCalledTimes(1);
    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ changeX: 10, changeY: 5 })
    );
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

  describe('keyboardShouldPersistTaps="never" drop', () => {
    // The keyboard-visibility tracker subscribes via Keyboard.addListener when a
    // ScrollView mounts. We spy on it to grab the captured `keyboardDidShow`
    // handler and invoke it, simulating the keyboard being open.
    const showKeyboard = (addListenerSpy: jest.SpyInstance, height = 300) => {
      const showCall = addListenerSpy.mock.calls.find(
        (call) => call[0] === 'keyboardDidShow'
      );
      act(() => {
        showCall?.[1]?.({ endCoordinates: { height } });
      });
    };

    const makeContext = (
      keyboardShouldPersistTaps: JSResponderContextValue['keyboardShouldPersistTaps']
    ): JSResponderContextValue => ({
      isRNGHResponderEvent: { current: false },
      keyboardShouldPersistTaps,
    });

    test('isKeyboardDismissingTap is true only in never mode while the keyboard is visible', async () => {
      const addListenerSpy = jest.spyOn(Keyboard, 'addListener');

      render(
        <GestureHandlerRootView>
          <ScrollView keyboardShouldPersistTaps="never" />
        </GestureHandlerRootView>
      );
      await act(flushImmediate);

      // Keyboard not shown yet -> nothing to dismiss.
      expect(isKeyboardDismissingTap(makeContext('never'))).toBe(false);

      showKeyboard(addListenerSpy);

      // `never` (and its default, undefined) drops the tap; the others never do.
      expect(isKeyboardDismissingTap(makeContext('never'))).toBe(true);
      expect(isKeyboardDismissingTap(makeContext(undefined))).toBe(true);
      expect(isKeyboardDismissingTap(makeContext('handled'))).toBe(false);
      expect(isKeyboardDismissingTap(makeContext('always'))).toBe(false);
      // Outside an RNGH ScrollView there is no context, so nothing is dropped.
      expect(isKeyboardDismissingTap(null)).toBe(false);

      addListenerSpy.mockRestore();
    });

    test('isKeyboardDismissingTap is false for a detached (height 0) keyboard', async () => {
      const addListenerSpy = jest.spyOn(Keyboard, 'addListener');

      render(
        <GestureHandlerRootView>
          <ScrollView keyboardShouldPersistTaps="never" />
        </GestureHandlerRootView>
      );
      await act(flushImmediate);

      // A detached/floating keyboard reports height 0 - nothing to dismiss.
      showKeyboard(addListenerSpy, 0);

      expect(isKeyboardDismissingTap(makeContext('never'))).toBe(false);

      addListenerSpy.mockRestore();
    });

    test('Touchable does NOT fire any press callback on the keyboard-dismissing tap (never)', async () => {
      const addListenerSpy = jest.spyOn(Keyboard, 'addListener');
      const onPress = jest.fn();
      const onPressIn = jest.fn();
      const onPressOut = jest.fn();

      render(
        <GestureHandlerRootView>
          <ScrollView keyboardShouldPersistTaps="never">
            <Touchable
              testID="touchable"
              onPress={onPress}
              onPressIn={onPressIn}
              onPressOut={onPressOut}
            />
          </ScrollView>
        </GestureHandlerRootView>
      );
      await act(flushImmediate);
      showKeyboard(addListenerSpy);

      // Includes a re-entry PressIn (finger dragged out and back in) so the
      // capture-once verdict path is exercised too.
      const button = screen.getByTestId('touchable');
      fireEvent(button, 'buttonPressIn', buttonEvent());
      fireEvent(button, 'buttonPressOut', buttonEvent(false));
      fireEvent(button, 'buttonPressIn', buttonEvent());
      fireEvent(button, 'buttonPressOut', buttonEvent());
      fireEvent(button, 'buttonPress', buttonEvent());
      fireEvent(button, 'buttonInteractionFinished', buttonEvent());

      // The whole interaction is swallowed - not just onPress, but the press-in/
      // out side effects too (incl. the re-entry as the finger moves).
      expect(onPress).not.toHaveBeenCalled();
      expect(onPressIn).not.toHaveBeenCalled();
      expect(onPressOut).not.toHaveBeenCalled();
      addListenerSpy.mockRestore();
    });

    test('Touchable fires onPress in never mode when the keyboard is not visible', async () => {
      const onPress = jest.fn();

      render(
        <GestureHandlerRootView>
          <ScrollView keyboardShouldPersistTaps="never">
            <Touchable testID="touchable" onPress={onPress} />
          </ScrollView>
        </GestureHandlerRootView>
      );
      await act(flushImmediate);

      fireNativeTap('touchable');

      expect(onPress).toHaveBeenCalledTimes(1);
    });

    test.each(['handled', 'always'] as const)(
      'Touchable fires onPress in %s mode even while the keyboard is visible',
      async (mode) => {
        const addListenerSpy = jest.spyOn(Keyboard, 'addListener');
        const onPress = jest.fn();

        render(
          <GestureHandlerRootView>
            <ScrollView keyboardShouldPersistTaps={mode}>
              <Touchable testID="touchable" onPress={onPress} />
            </ScrollView>
          </GestureHandlerRootView>
        );
        await act(flushImmediate);
        showKeyboard(addListenerSpy);

        fireNativeTap('touchable');

        expect(onPress).toHaveBeenCalledTimes(1);
        addListenerSpy.mockRestore();
      }
    );
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
      fireNativeTap('touchable');

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

      // A cancelled interaction ends without a Press event on the native side.
      const button = screen.getByTestId('touchable');
      fireEvent(button, 'buttonPressIn', buttonEvent());
      fireEvent(button, 'buttonPressOut', buttonEvent(false));
      fireEvent(button, 'buttonInteractionFinished', buttonEvent(false));

      expect(pressFn).not.toHaveBeenCalled();
    });

    test('forwards onLongPress and requests the native long-press timer', () => {
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

      // The long-press timer runs on the native side; passing a callback flips
      // the props that arm it.
      const button = screen.getByTestId('touchable');
      expect(button.props.hasLongPressHandler).toBe(true);
      expect(button.props.longPressDuration).toBe(DELAY);

      // A long press ends without a Press event on the native side.
      fireEvent(button, 'buttonPressIn', buttonEvent());
      fireEvent(button, 'buttonLongPress', buttonEvent());
      fireEvent(button, 'buttonPressOut', buttonEvent());
      fireEvent(button, 'buttonInteractionFinished', buttonEvent());

      expect(longPressFn).toHaveBeenCalledTimes(1);
      expect(pressFn).not.toHaveBeenCalled();
    });
  });
});
