import { fireEvent, render, screen } from '@testing-library/react-native';
import React, { act } from 'react';
import type { KeyboardEvent, Platform as PlatformModule } from 'react-native';
import {
  AccessibilityInfo,
  DeviceEventEmitter,
  Keyboard,
  Platform,
  Text,
  TextInput,
} from 'react-native';

import type {
  PressableEvent,
  PressableProps,
} from '../components/Pressable/PressableProps';
import type {
  GestureTouchEvent,
  TouchData,
} from '../handlers/gestureHandlerCommon';
import type { GestureType } from '../handlers/gestures/gesture';
import type { ComposedGesture as LegacyComposedGesture } from '../handlers/gestures/gestureComposition';
import { GestureDetector as LegacyGestureDetector } from '../handlers/gestures/GestureDetector';
import { longPressHandlerName } from '../handlers/LongPressGestureHandler';
import { nativeViewHandlerName } from '../handlers/NativeViewGestureHandler';
import { GestureHandlerRootView, LegacyPressable, State } from '../index';
import { fireGestureHandler } from '../jestUtils';
import { PointerType } from '../PointerType';
import { TouchEventType } from '../TouchEventType';
import { Pressable, ScrollView } from '../v3/components';
import { GestureDetector } from '../v3/detectors';
import { isComposedGesture } from '../v3/hooks/utils';
import {
  isKeyboardDismissingTap,
  type JSResponderContextValue,
  setKeyboardVisibility,
} from '../v3/scrollViewInterop';
import type { ComposedGesture, SingleGesture } from '../v3/types';
import { SingleGestureName } from '../v3/types';

// `jestSetup.js` replaces LegacyPressable with its testing mock, and this test is about the component itself.
jest.unmock('../components/Pressable/Pressable');

// Both state-machine engines read `Platform.OS` to pick their Android path.
jest.mock('react-native/Libraries/Utilities/Platform', () => {
  const actual = jest.requireActual<{ default: typeof PlatformModule }>(
    'react-native/Libraries/Utilities/Platform'
  ).default;
  return {
    __esModule: true,
    default: {
      ...actual,
      OS: 'android',
      select: (spec: Record<string, unknown>) =>
        'android' in spec ? spec.android : (spec.native ?? spec.default),
    },
  };
});

type StateTransition = { oldState: State; state: State };

const BEGAN: StateTransition = {
  oldState: State.UNDETERMINED,
  state: State.BEGAN,
};
const ACTIVATED: StateTransition = {
  oldState: State.BEGAN,
  state: State.ACTIVE,
};
const ENDED: StateTransition = { oldState: State.ACTIVE, state: State.END };
const CANCELLED: StateTransition = {
  oldState: State.ACTIVE,
  state: State.CANCELLED,
};

type NativeGestureEvent = StateTransition & {
  numberOfPointers: number;
  pointerType: PointerType;
  x?: number;
  y?: number;
  absoluteX?: number;
  absoluteY?: number;
};

const reportingPointers =
  (numberOfPointers: number, pointerType: PointerType) =>
  (transition: StateTransition): NativeGestureEvent => ({
    ...transition,
    numberOfPointers,
    pointerType,
  });

const withTouch = reportingPointers(1, PointerType.TOUCH);

const BUTTON_LAYOUT = { x: 0, y: 0, width: 120, height: 44 };
const BUTTON_CENTER_TOUCH = {
  x: BUTTON_LAYOUT.width / 2,
  y: BUTTON_LAYOUT.height / 2,
};
const BUTTON_SCREEN_ORIGIN = { x: 100, y: 300 };

// `prepareActivationWithoutPointer` places an activation no pointer drives at the button's center, and reports that center on the screen.
const POSITION_WITHOUT_POINTER = {
  x: BUTTON_CENTER_TOUCH.x,
  y: BUTTON_CENTER_TOUCH.y,
  absoluteX: BUTTON_SCREEN_ORIGIN.x + BUTTON_CENTER_TOUCH.x,
  absoluteY: BUTTON_SCREEN_ORIGIN.y + BUTTON_CENTER_TOUCH.y,
};

// A hardware Enter or Space reaches the button through `performClick`, which
// begins, activates and ends its native gesture reporting no pointer
// (https://www.w3.org/TR/pointerevents3/#event-attributes); an accessibility
// service's click does the same with an unknown pointer type.
const withoutPointer =
  (pointerType: PointerType) =>
  (transition: StateTransition): NativeGestureEvent => ({
    ...reportingPointers(0, pointerType)(transition),
    ...POSITION_WITHOUT_POINTER,
  });

const CLICK_WITHOUT_TOUCH = [BEGAN, ACTIVATED, ENDED].map(
  withoutPointer(PointerType.KEY)
);
// Apple's native view handler sends a press no touch drives, a TV's focus Select press among them, as a key at the view's center.
const APPLE_PRESS_WITHOUT_TOUCH = [BEGAN, ACTIVATED, ENDED].map(
  withoutPointer(PointerType.KEY)
);
const PRESSED_WHERE_NATIVE_GESTURE_REPORTS = {
  locationX: POSITION_WITHOUT_POINTER.x,
  locationY: POSITION_WITHOUT_POINTER.y,
  pageX: POSITION_WITHOUT_POINTER.absoluteX,
  pageY: POSITION_WITHOUT_POINTER.absoluteY,
};
const CANCELLED_WITHOUT_TOUCH = [BEGAN, ACTIVATED, CANCELLED].map(
  withoutPointer(PointerType.KEY)
);
const ACCESSIBILITY_CLICK = [BEGAN, ACTIVATED, ENDED].map(
  withoutPointer(PointerType.OTHER)
);

afterEach(() => {
  jest.restoreAllMocks();
});

// A touch there begins both gestures, but lies outside the button, so it never presses in.
const PRESS_RETENTION_OFFSET = 20;
const RETENTION_ZONE_TOUCH = { x: 130, y: 22 };

// A hit slop that takes the button's left half, center included, out of what a pointer can press.
const CENTER_EXCLUDING_HIT_SLOP = { left: -(BUTTON_CENTER_TOUCH.x + 10) };

type PressHandler = jest.Mock<void, [PressableEvent]>;

type PressHandlers = {
  onPress: PressHandler;
  onPressIn: PressHandler;
  onPressOut: PressHandler;
};

type EngineProps = PressHandlers &
  Pick<PressableProps, 'hitSlop' | 'pressRetentionOffset'>;

type PressableContainer = (pressable: React.ReactElement) => React.ReactElement;

const renderAlone: PressableContainer = (pressable) => pressable;

type EngineDriver = {
  render: (props: EngineProps, container?: PressableContainer) => Promise<void>;
  fireNativeGesture: (events: NativeGestureEvent[]) => void;
  changeNativeGestureState: (event: NativeGestureEvent) => void;
  touchDownOnPressGesture: (touch: Pick<TouchData, 'x' | 'y'>) => void;
};

const createPressHandlers = (): PressHandlers => ({
  onPress: jest.fn<void, [PressableEvent]>(),
  onPressIn: jest.fn<void, [PressableEvent]>(),
  onPressOut: jest.fn<void, [PressableEvent]>(),
});

const expectPressedOnceAt = (
  handlers: PressHandlers,
  position: Partial<PressableEvent['nativeEvent']>
) => {
  for (const handler of [
    handlers.onPressIn,
    handlers.onPressOut,
    handlers.onPress,
  ]) {
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].nativeEvent).toMatchObject(position);
  }
};

const flushImmediate = () =>
  new Promise((resolve) => {
    setImmediate(() => resolve(undefined));
  });

// `useIsScreenReaderEnabled` reads the screen reader asynchronously after mount.
const renderSettled = async (element: React.ReactElement) => {
  render(element);
  await act(flushImmediate);
};

const layOutButton = () => {
  fireEvent(screen.getByTestId('pressable'), 'layout', {
    nativeEvent: { layout: BUTTON_LAYOUT },
  });
};

const insideScrollViewDismissingKeyboard: PressableContainer = (pressable) => (
  <ScrollView keyboardShouldPersistTaps="never">{pressable}</ScrollView>
);

// A tap is driven by one pointer.
const ONE_POINTER = 1;

const NEVER_PERSIST_TAPS_CONTEXT: JSResponderContextValue = {
  isRNGHResponderEvent: { current: false },
  keyboardShouldPersistTaps: 'never',
};

const focusTextInput = () => {
  jest
    .spyOn(TextInput.State, 'currentlyFocusedInput')
    .mockReturnValue(
      {} as ReturnType<typeof TextInput.State.currentlyFocusedInput>
    );
};

const KEYBOARD_SHOWN: KeyboardEvent = {
  duration: 0,
  easing: 'keyboard',
  endCoordinates: { screenX: 0, screenY: 500, width: 360, height: 300 },
};

type KeyboardListenerSpy = jest.SpyInstance<
  ReturnType<typeof Keyboard.addListener>,
  Parameters<typeof Keyboard.addListener>
>;

// A gesture-handler `ScrollView` tracks the keyboard through the listeners it adds on mount.
const emitKeyboardEvent = (
  addListenerSpy: KeyboardListenerSpy,
  eventName: 'keyboardDidHide' | 'keyboardDidShow'
) => {
  const listener = addListenerSpy.mock.calls.find(
    ([listenedName]) => listenedName === eventName
  )?.[1];
  if (listener === undefined) {
    throw new Error('No ScrollView tracks the keyboard');
  }
  act(() => {
    listener(KEYBOARD_SHOWN);
  });
};

const createTouchEvent = (
  handlerTag: number,
  eventType: TouchEventType,
  { x, y }: Pick<TouchData, 'x' | 'y'>
): GestureTouchEvent => {
  const touch: TouchData = { id: 0, x, y, absoluteX: x, absoluteY: y };
  return {
    handlerTag,
    numberOfTouches: 1,
    state: State.BEGAN,
    eventType,
    allTouches: [touch],
    changedTouches: [touch],
    pointerType: PointerType.TOUCH,
  };
};

const findStatefulGesture = (
  type: SingleGestureName
): SingleGesture<unknown, unknown> => {
  const composed = screen.UNSAFE_getByType(GestureDetector).props
    .gesture as ComposedGesture;
  for (const candidate of composed.gestures) {
    if (!isComposedGesture(candidate) && candidate.type === type) {
      return candidate;
    }
  }
  throw new Error(`StatefulPressable renders no ${type} gesture`);
};

const findLegacyGesture = (handlerName: string): GestureType => {
  const composed = screen.UNSAFE_getByType(LegacyGestureDetector).props
    .gesture as LegacyComposedGesture;
  const gesture = composed
    .toGestureArray()
    .find((candidate: GestureType) => candidate.handlerName === handlerName);
  if (gesture === undefined) {
    throw new Error(`LegacyPressable renders no ${handlerName}`);
  }
  return gesture;
};

const statefulDriver: EngineDriver = {
  render: (props, container = renderAlone) =>
    renderSettled(
      <GestureHandlerRootView>
        {container(
          // A relation prop routes `Pressable` to the `StatefulPressable` engine.
          <Pressable testID="pressable" simultaneousWith={[]} {...props}>
            <Text>Press Me</Text>
          </Pressable>
        )}
      </GestureHandlerRootView>
    ),
  fireNativeGesture: (events) => {
    act(() => {
      fireGestureHandler(findStatefulGesture(SingleGestureName.Native), events);
    });
  },
  changeNativeGestureState: ({ oldState, state, ...pointers }) => {
    const gesture = findStatefulGesture(SingleGestureName.Native);
    act(() => {
      gesture.detectorCallbacks.jsEventHandler?.({
        handlerTag: gesture.handlerTag,
        oldState,
        state,
        handlerData: pointers,
      });
    });
  },
  touchDownOnPressGesture: (touch) => {
    const gesture = findStatefulGesture(SingleGestureName.LongPress);
    act(() => {
      gesture.detectorCallbacks.jsEventHandler?.(
        createTouchEvent(gesture.handlerTag, TouchEventType.TOUCHES_DOWN, touch)
      );
    });
  },
};

const legacyDriver: EngineDriver = {
  render: (props, container = renderAlone) =>
    renderSettled(
      <GestureHandlerRootView>
        {container(
          <LegacyPressable testID="pressable" {...props}>
            <Text>Press Me</Text>
          </LegacyPressable>
        )}
      </GestureHandlerRootView>
    ),
  fireNativeGesture: (events) => {
    const gesture = findLegacyGesture(nativeViewHandlerName);
    act(() => {
      fireGestureHandler(gesture, events);
    });
  },
  changeNativeGestureState: (event) => {
    const { handlerTag } = findLegacyGesture(nativeViewHandlerName);
    act(() => {
      DeviceEventEmitter.emit('onGestureHandlerStateChange', {
        handlerTag,
        ...event,
        pointerInside: true,
      });
    });
  },
  touchDownOnPressGesture: (touch) => {
    const { handlerTag } = findLegacyGesture(longPressHandlerName);
    act(() => {
      DeviceEventEmitter.emit(
        'onGestureHandlerEvent',
        createTouchEvent(handlerTag, TouchEventType.TOUCHES_DOWN, touch)
      );
    });
  },
};

describe.each([
  ['StatefulPressable', statefulDriver],
  ['LegacyPressable', legacyDriver],
] as const)('%s on Android', (_name, driver) => {
  test('runs onPress once when its button is clicked without a touch', async () => {
    const handlers = createPressHandlers();
    await driver.render(handlers);
    layOutButton();

    driver.fireNativeGesture(CLICK_WITHOUT_TOUCH);

    expect(handlers.onPressIn).toHaveBeenCalledTimes(1);
    expect(handlers.onPressOut).toHaveBeenCalledTimes(1);
    expect(handlers.onPress).toHaveBeenCalledTimes(1);
  });

  test('presses at the position the native gesture reports for a click without a touch', async () => {
    const handlers = createPressHandlers();
    await driver.render(handlers);
    layOutButton();

    driver.fireNativeGesture(CLICK_WITHOUT_TOUCH);

    expectPressedOnceAt(handlers, PRESSED_WHERE_NATIVE_GESTURE_REPORTS);
  });

  test('presses in and out without onPress when the native gesture is cancelled without a touch', async () => {
    const handlers = createPressHandlers();
    await driver.render(handlers);
    layOutButton();

    driver.fireNativeGesture(CANCELLED_WITHOUT_TOUCH);

    expect(handlers.onPressIn).toHaveBeenCalledTimes(1);
    expect(handlers.onPressOut).toHaveBeenCalledTimes(1);
    expect(handlers.onPress).not.toHaveBeenCalled();
  });

  test('runs onPress once for a screen reader click', async () => {
    jest
      .spyOn(AccessibilityInfo, 'isScreenReaderEnabled')
      .mockResolvedValueOnce(true);
    const handlers = createPressHandlers();
    await driver.render(handlers);
    layOutButton();

    driver.fireNativeGesture(ACCESSIBILITY_CLICK);

    expect(handlers.onPressIn).toHaveBeenCalledTimes(1);
    expect(handlers.onPressOut).toHaveBeenCalledTimes(1);
    expect(handlers.onPress).toHaveBeenCalledTimes(1);
  });

  // Switch Access and Voice Access click without turning on touch exploration, which is what reads as a screen reader.
  test('runs onPress once for an accessibility service click with no screen reader on', async () => {
    const handlers = createPressHandlers();
    await driver.render(handlers);
    layOutButton();

    driver.fireNativeGesture(ACCESSIBILITY_CLICK);

    expect(handlers.onPressIn).toHaveBeenCalledTimes(1);
    expect(handlers.onPressOut).toHaveBeenCalledTimes(1);
    expect(handlers.onPress).toHaveBeenCalledTimes(1);
  });

  test('runs onPress once for a touch press', async () => {
    const handlers = createPressHandlers();
    await driver.render(handlers);
    layOutButton();

    driver.changeNativeGestureState(withTouch(BEGAN));
    driver.touchDownOnPressGesture(BUTTON_CENTER_TOUCH);
    driver.changeNativeGestureState(withTouch(ACTIVATED));
    driver.changeNativeGestureState(withTouch(ENDED));

    expect(handlers.onPressIn).toHaveBeenCalledTimes(1);
    expect(handlers.onPressOut).toHaveBeenCalledTimes(1);
    expect(handlers.onPress).toHaveBeenCalledTimes(1);
  });

  test('runs onPress once for a click after a touch its native gesture never saw', async () => {
    const handlers = createPressHandlers();
    await driver.render(handlers);
    layOutButton();

    // A tap on a nested button in a scroll container cancels this button's native gesture while undetermined, which reaches JS as nothing, after its long press saw the touch.
    driver.touchDownOnPressGesture(BUTTON_CENTER_TOUCH);
    driver.fireNativeGesture(CLICK_WITHOUT_TOUCH);

    expect(handlers.onPressIn).toHaveBeenCalledTimes(1);
    expect(handlers.onPressOut).toHaveBeenCalledTimes(1);
    expect(handlers.onPress).toHaveBeenCalledTimes(1);
  });

  test('runs nothing for a native gesture that reports a pointer the press gesture never saw', async () => {
    const handlers = createPressHandlers();
    await driver.render(handlers);
    layOutButton();

    driver.changeNativeGestureState(withTouch(BEGAN));
    driver.changeNativeGestureState(withTouch(ACTIVATED));
    driver.changeNativeGestureState(withTouch(ENDED));

    expect(handlers.onPressIn).not.toHaveBeenCalled();
    expect(handlers.onPress).not.toHaveBeenCalled();
  });

  test('runs nothing for a touch that begins in the press retention zone', async () => {
    const handlers = createPressHandlers();
    await driver.render({
      ...handlers,
      pressRetentionOffset: PRESS_RETENTION_OFFSET,
    });
    layOutButton();

    driver.changeNativeGestureState(withTouch(BEGAN));
    driver.touchDownOnPressGesture(RETENTION_ZONE_TOUCH);
    driver.changeNativeGestureState(withTouch(ACTIVATED));
    driver.changeNativeGestureState(withTouch(ENDED));

    expect(handlers.onPressIn).not.toHaveBeenCalled();
    expect(handlers.onPress).not.toHaveBeenCalled();
  });

  test('runs onPress once for a click without a touch before its layout is measured', async () => {
    const handlers = createPressHandlers();
    await driver.render(handlers);

    driver.fireNativeGesture(CLICK_WITHOUT_TOUCH);

    expect(handlers.onPressIn).toHaveBeenCalledTimes(1);
    expect(handlers.onPressOut).toHaveBeenCalledTimes(1);
    expect(handlers.onPress).toHaveBeenCalledTimes(1);
  });

  test('runs onPress once for a click without a touch whose hit slop leaves out its center', async () => {
    const handlers = createPressHandlers();
    await driver.render({ ...handlers, hitSlop: CENTER_EXCLUDING_HIT_SLOP });
    layOutButton();

    driver.fireNativeGesture(CLICK_WITHOUT_TOUCH);

    expect(handlers.onPressIn).toHaveBeenCalledTimes(1);
    expect(handlers.onPressOut).toHaveBeenCalledTimes(1);
    expect(handlers.onPress).toHaveBeenCalledTimes(1);
  });

  // The screen reader's own branch presses at the layout center, which this hit slop leaves out.
  test('runs onPress once for a screen reader click whose hit slop leaves out its center', async () => {
    jest
      .spyOn(AccessibilityInfo, 'isScreenReaderEnabled')
      .mockResolvedValueOnce(true);
    const handlers = createPressHandlers();
    await driver.render({ ...handlers, hitSlop: CENTER_EXCLUDING_HIT_SLOP });
    layOutButton();

    driver.fireNativeGesture(ACCESSIBILITY_CLICK);

    expect(handlers.onPressIn).toHaveBeenCalledTimes(1);
    expect(handlers.onPressOut).toHaveBeenCalledTimes(1);
    expect(handlers.onPress).toHaveBeenCalledTimes(1);
  });
});

// The default `Pressable` presses from the press events its native button sends.
const buttonEvent = (numberOfPointers: number, pointerType: PointerType) => ({
  nativeEvent: {
    pointerInside: true,
    ...POSITION_WITHOUT_POINTER,
    numberOfPointers,
    pointerType,
  },
});

const pressButton = (event: ReturnType<typeof buttonEvent>) => {
  const button = screen.getByTestId('pressable');
  for (const eventName of [
    'buttonPressIn',
    'buttonPressOut',
    'buttonPress',
    'buttonInteractionFinished',
  ]) {
    fireEvent(button, eventName, event);
  }
};

const renderDefaultPressable = (props: EngineProps) =>
  renderSettled(
    <GestureHandlerRootView>
      <Pressable testID="pressable" {...props}>
        <Text>Press Me</Text>
      </Pressable>
    </GestureHandlerRootView>
  );

describe('Pressable on Android', () => {
  test('runs onPress once for a click without a touch before its layout is measured', async () => {
    const handlers = createPressHandlers();
    await renderDefaultPressable(handlers);

    pressButton(buttonEvent(0, PointerType.KEY));

    expect(handlers.onPressIn).toHaveBeenCalledTimes(1);
    expect(handlers.onPressOut).toHaveBeenCalledTimes(1);
    expect(handlers.onPress).toHaveBeenCalledTimes(1);
  });

  test('runs onPress once for a click without a touch whose hit slop leaves out its center', async () => {
    const handlers = createPressHandlers();
    await renderDefaultPressable({
      ...handlers,
      hitSlop: CENTER_EXCLUDING_HIT_SLOP,
    });
    layOutButton();

    pressButton(buttonEvent(0, PointerType.KEY));

    expect(handlers.onPressIn).toHaveBeenCalledTimes(1);
    expect(handlers.onPressOut).toHaveBeenCalledTimes(1);
    expect(handlers.onPress).toHaveBeenCalledTimes(1);
  });

  test('runs nothing for a touch at its center when its hit slop leaves the center out', async () => {
    const handlers = createPressHandlers();
    await renderDefaultPressable({
      ...handlers,
      hitSlop: CENTER_EXCLUDING_HIT_SLOP,
    });
    layOutButton();

    pressButton(buttonEvent(1, PointerType.TOUCH));

    expect(handlers.onPressIn).not.toHaveBeenCalled();
    expect(handlers.onPress).not.toHaveBeenCalled();
  });
});

describe.each([
  ['StatefulPressable', statefulDriver],
  ['LegacyPressable', legacyDriver],
] as const)('%s on a TV', (_name, driver) => {
  test('presses an Android TV key press at the position its native gesture reports', async () => {
    jest.replaceProperty(Platform, 'isTV', true);
    const handlers = createPressHandlers();
    await driver.render(handlers);
    layOutButton();

    driver.fireNativeGesture(CLICK_WITHOUT_TOUCH);

    expectPressedOnceAt(handlers, PRESSED_WHERE_NATIVE_GESTURE_REPORTS);
  });

  test('presses a tvOS focus press at the position its native gesture reports', async () => {
    jest.replaceProperty(Platform, 'OS', 'ios');
    jest.replaceProperty(Platform, 'isTV', true);
    const handlers = createPressHandlers();
    await driver.render(handlers);
    layOutButton();

    driver.fireNativeGesture(APPLE_PRESS_WITHOUT_TOUCH);

    expectPressedOnceAt(handlers, PRESSED_WHERE_NATIVE_GESTURE_REPORTS);
  });

  test('presses a tvOS focus press whose hit slop leaves out its center', async () => {
    jest.replaceProperty(Platform, 'OS', 'ios');
    jest.replaceProperty(Platform, 'isTV', true);
    const handlers = createPressHandlers();
    await driver.render({ ...handlers, hitSlop: CENTER_EXCLUDING_HIT_SLOP });
    layOutButton();

    driver.fireNativeGesture(APPLE_PRESS_WITHOUT_TOUCH);

    expect(handlers.onPressIn).toHaveBeenCalledTimes(1);
    expect(handlers.onPressOut).toHaveBeenCalledTimes(1);
    expect(handlers.onPress).toHaveBeenCalledTimes(1);
  });

  test('presses a tvOS press that reports a pointer, as nothing on tvOS points at the screen', async () => {
    jest.replaceProperty(Platform, 'OS', 'ios');
    jest.replaceProperty(Platform, 'isTV', true);
    const handlers = createPressHandlers();
    await driver.render(handlers);
    layOutButton();

    driver.fireNativeGesture([BEGAN, ACTIVATED, ENDED].map(withTouch));

    expect(handlers.onPressIn).toHaveBeenCalledTimes(1);
    expect(handlers.onPressOut).toHaveBeenCalledTimes(1);
    expect(handlers.onPress).toHaveBeenCalledTimes(1);
  });

  test('runs nothing for a touch on an Android TV that begins in the press retention zone', async () => {
    jest.replaceProperty(Platform, 'isTV', true);
    const handlers = createPressHandlers();
    await driver.render({
      ...handlers,
      pressRetentionOffset: PRESS_RETENTION_OFFSET,
    });
    layOutButton();

    driver.changeNativeGestureState(withTouch(BEGAN));
    driver.touchDownOnPressGesture(RETENTION_ZONE_TOUCH);
    driver.changeNativeGestureState(withTouch(ACTIVATED));
    driver.changeNativeGestureState(withTouch(ENDED));

    expect(handlers.onPressIn).not.toHaveBeenCalled();
    expect(handlers.onPress).not.toHaveBeenCalled();
  });
});

describe('Pressable on a TV', () => {
  test('presses a tvOS focus press whose hit slop leaves out its center', async () => {
    jest.replaceProperty(Platform, 'OS', 'ios');
    jest.replaceProperty(Platform, 'isTV', true);
    const handlers = createPressHandlers();
    await renderDefaultPressable({
      ...handlers,
      hitSlop: CENTER_EXCLUDING_HIT_SLOP,
    });
    layOutButton();

    pressButton(buttonEvent(0, PointerType.KEY));

    expect(handlers.onPressIn).toHaveBeenCalledTimes(1);
    expect(handlers.onPressOut).toHaveBeenCalledTimes(1);
    expect(handlers.onPress).toHaveBeenCalledTimes(1);
  });

  test('presses a tvOS press that reports a pointer under a hit slop that leaves out its center', async () => {
    jest.replaceProperty(Platform, 'OS', 'ios');
    jest.replaceProperty(Platform, 'isTV', true);
    const handlers = createPressHandlers();
    await renderDefaultPressable({
      ...handlers,
      hitSlop: CENTER_EXCLUDING_HIT_SLOP,
    });
    layOutButton();

    pressButton(buttonEvent(1, PointerType.TOUCH));

    expect(handlers.onPressIn).toHaveBeenCalledTimes(1);
    expect(handlers.onPressOut).toHaveBeenCalledTimes(1);
    expect(handlers.onPress).toHaveBeenCalledTimes(1);
  });

  test('runs nothing for a touch on an Android TV at its center when its hit slop leaves the center out', async () => {
    jest.replaceProperty(Platform, 'isTV', true);
    const handlers = createPressHandlers();
    await renderDefaultPressable({
      ...handlers,
      hitSlop: CENTER_EXCLUDING_HIT_SLOP,
    });
    layOutButton();

    pressButton(buttonEvent(1, PointerType.TOUCH));

    expect(handlers.onPressIn).not.toHaveBeenCalled();
    expect(handlers.onPress).not.toHaveBeenCalled();
  });
});

describe.each([
  ['StatefulPressable', statefulDriver],
  ['LegacyPressable', legacyDriver],
] as const)('%s on iOS', (_name, driver) => {
  test('presses a press no touch drives at the position its native gesture reports', async () => {
    jest.replaceProperty(Platform, 'OS', 'ios');
    const handlers = createPressHandlers();
    await driver.render(handlers);
    layOutButton();

    driver.fireNativeGesture(APPLE_PRESS_WITHOUT_TOUCH);

    expectPressedOnceAt(handlers, PRESSED_WHERE_NATIVE_GESTURE_REPORTS);
  });

  // On iOS the press gesture sees the touch before the native gesture begins.
  test('runs onPress once for a touch press', async () => {
    jest.replaceProperty(Platform, 'OS', 'ios');
    const handlers = createPressHandlers();
    await driver.render(handlers);
    layOutButton();

    driver.touchDownOnPressGesture(BUTTON_CENTER_TOUCH);
    driver.changeNativeGestureState(withTouch(BEGAN));
    driver.changeNativeGestureState(withTouch(ACTIVATED));
    driver.changeNativeGestureState(withTouch(ENDED));

    expect(handlers.onPressIn).toHaveBeenCalledTimes(1);
    expect(handlers.onPressOut).toHaveBeenCalledTimes(1);
    expect(handlers.onPress).toHaveBeenCalledTimes(1);
  });

  test('runs nothing for a touch that begins in the press retention zone', async () => {
    jest.replaceProperty(Platform, 'OS', 'ios');
    const handlers = createPressHandlers();
    await driver.render({
      ...handlers,
      pressRetentionOffset: PRESS_RETENTION_OFFSET,
    });
    layOutButton();

    driver.touchDownOnPressGesture(RETENTION_ZONE_TOUCH);
    driver.changeNativeGestureState(withTouch(BEGAN));
    driver.changeNativeGestureState(withTouch(ACTIVATED));
    driver.changeNativeGestureState(withTouch(ENDED));

    expect(handlers.onPressIn).not.toHaveBeenCalled();
    expect(handlers.onPress).not.toHaveBeenCalled();
  });
});

describe('Pressable on iOS', () => {
  test('presses a press no touch drives whose hit slop leaves out its center', async () => {
    jest.replaceProperty(Platform, 'OS', 'ios');
    const handlers = createPressHandlers();
    await renderDefaultPressable({
      ...handlers,
      hitSlop: CENTER_EXCLUDING_HIT_SLOP,
    });
    layOutButton();

    pressButton(buttonEvent(0, PointerType.KEY));

    expect(handlers.onPressIn).toHaveBeenCalledTimes(1);
    expect(handlers.onPressOut).toHaveBeenCalledTimes(1);
    expect(handlers.onPress).toHaveBeenCalledTimes(1);
  });

  test('runs nothing for a touch at its center when its hit slop leaves the center out', async () => {
    jest.replaceProperty(Platform, 'OS', 'ios');
    const handlers = createPressHandlers();
    await renderDefaultPressable({
      ...handlers,
      hitSlop: CENTER_EXCLUDING_HIT_SLOP,
    });
    layOutButton();

    pressButton(buttonEvent(1, PointerType.TOUCH));

    expect(handlers.onPressIn).not.toHaveBeenCalled();
    expect(handlers.onPress).not.toHaveBeenCalled();
  });
});

// The press gesture sees a touch, and a scroll cancels it before the native gesture begins.
const cancelTouchOnStatefulPressGesture = (
  touch: Pick<TouchData, 'x' | 'y'>
) => {
  const gesture = findStatefulGesture(SingleGestureName.LongPress);
  const handle = gesture.detectorCallbacks.jsEventHandler;
  const pointers = {
    numberOfPointers: ONE_POINTER,
    pointerType: PointerType.TOUCH,
  };
  act(() => {
    handle?.({
      handlerTag: gesture.handlerTag,
      ...BEGAN,
      handlerData: pointers,
    });
    handle?.(
      createTouchEvent(gesture.handlerTag, TouchEventType.TOUCHES_DOWN, touch)
    );
    handle?.(
      createTouchEvent(gesture.handlerTag, TouchEventType.TOUCHES_CANCEL, touch)
    );
    handle?.({
      handlerTag: gesture.handlerTag,
      oldState: State.BEGAN,
      state: State.CANCELLED,
      handlerData: pointers,
    });
  });
};

// Only `StatefulPressable` drops the tap that dismisses the keyboard, so only it is driven with the keyboard up.
describe('StatefulPressable on Android with the keyboard up for a React Native input', () => {
  const renderWithKeyboardUp = async (handlers: PressHandlers) => {
    const addListenerSpy = jest.spyOn(Keyboard, 'addListener');
    focusTextInput();
    await statefulDriver.render(handlers, insideScrollViewDismissingKeyboard);
    layOutButton();
    emitKeyboardEvent(addListenerSpy, 'keyboardDidShow');
    expect(
      isKeyboardDismissingTap(NEVER_PERSIST_TAPS_CONTEXT, ONE_POINTER)
    ).toBe(true);
    return addListenerSpy;
  };

  afterEach(() => {
    setKeyboardVisibility(false);
  });

  test('drops a touch press, which is the tap dismissing the keyboard', async () => {
    const handlers = createPressHandlers();
    await renderWithKeyboardUp(handlers);

    statefulDriver.changeNativeGestureState(withTouch(BEGAN));
    statefulDriver.touchDownOnPressGesture(BUTTON_CENTER_TOUCH);
    statefulDriver.changeNativeGestureState(withTouch(ACTIVATED));
    statefulDriver.changeNativeGestureState(withTouch(ENDED));

    expect(handlers.onPressIn).not.toHaveBeenCalled();
    expect(handlers.onPress).not.toHaveBeenCalled();
  });

  test('runs onPress once for a click without a touch', async () => {
    const handlers = createPressHandlers();
    await renderWithKeyboardUp(handlers);

    statefulDriver.fireNativeGesture(CLICK_WITHOUT_TOUCH);

    expect(handlers.onPressIn).toHaveBeenCalledTimes(1);
    expect(handlers.onPressOut).toHaveBeenCalledTimes(1);
    expect(handlers.onPress).toHaveBeenCalledTimes(1);
  });

  test('presses in as a screen reader click begins', async () => {
    jest
      .spyOn(AccessibilityInfo, 'isScreenReaderEnabled')
      .mockResolvedValueOnce(true);
    const handlers = createPressHandlers();
    await renderWithKeyboardUp(handlers);
    const [began, activated, ended] = ACCESSIBILITY_CLICK;

    statefulDriver.changeNativeGestureState(began);

    expect(handlers.onPressIn).toHaveBeenCalledTimes(1);

    statefulDriver.changeNativeGestureState(activated);
    statefulDriver.changeNativeGestureState(ended);

    expect(handlers.onPressOut).toHaveBeenCalledTimes(1);
    expect(handlers.onPress).toHaveBeenCalledTimes(1);
  });

  test('runs onPress once for a click without a touch after a touch the press gesture saw cancelled', async () => {
    const handlers = createPressHandlers();
    await renderWithKeyboardUp(handlers);

    cancelTouchOnStatefulPressGesture(BUTTON_CENTER_TOUCH);
    statefulDriver.fireNativeGesture(CLICK_WITHOUT_TOUCH);

    expect(handlers.onPressIn).toHaveBeenCalledTimes(1);
    expect(handlers.onPressOut).toHaveBeenCalledTimes(1);
    expect(handlers.onPress).toHaveBeenCalledTimes(1);
  });

  test('runs onPress once for a touch press after the keyboard hides, after a touch the press gesture saw cancelled', async () => {
    const handlers = createPressHandlers();
    const addListenerSpy = await renderWithKeyboardUp(handlers);

    cancelTouchOnStatefulPressGesture(BUTTON_CENTER_TOUCH);
    emitKeyboardEvent(addListenerSpy, 'keyboardDidHide');
    statefulDriver.changeNativeGestureState(withTouch(BEGAN));
    statefulDriver.touchDownOnPressGesture(BUTTON_CENTER_TOUCH);
    statefulDriver.changeNativeGestureState(withTouch(ACTIVATED));
    statefulDriver.changeNativeGestureState(withTouch(ENDED));

    expect(handlers.onPressIn).toHaveBeenCalledTimes(1);
    expect(handlers.onPressOut).toHaveBeenCalledTimes(1);
    expect(handlers.onPress).toHaveBeenCalledTimes(1);
  });
});
