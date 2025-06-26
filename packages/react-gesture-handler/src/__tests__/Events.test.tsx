/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// Disabling lint for assymetric matchers, check proposal below
// https://github.com/DefinitelyTyped/DefinitelyTyped/discussions/56937
import React from 'react';
import { render, cleanup } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import {
  GestureHandlerRootView,
  PanGestureHandler,
  LongPressGestureHandler,
  LongPressGestureHandlerGestureEvent,
  RotationGestureHandler,
  Gesture,
  GestureDetector,
  State,
  PanGesture,
  TapGesture,
} from '../index';
import { useAnimatedGestureHandler } from 'react-native-reanimated';
import { fireGestureHandler, getByGestureTestId } from '../jestUtils';

beforeEach(cleanup);

const mockedEventHandlers = () => {
  return {
    begin: jest.fn(),
    start: jest.fn(),
    active: jest.fn(),
    end: jest.fn(),
    fail: jest.fn(),
    cancel: jest.fn(),
    finish: jest.fn(),
  };
};

interface EventHandlersProps {
  eventHandlers: ReturnType<typeof mockedEventHandlers>;
}

describe('Using RNGH v1 base API', () => {
  function SingleHandler({ eventHandlers }: EventHandlersProps) {
    const handlers = {
      onBegan: eventHandlers.begin,
      onActivated: eventHandlers.active,
      onEnded: eventHandlers.end,
      onCancelled: eventHandlers.cancel,
      onFailed: eventHandlers.fail,
      onGestureEvent: eventHandlers.active,
    };

    return (
      <GestureHandlerRootView>
        <PanGestureHandler testID="pan" {...handlers}>
          <Text>Pan handler</Text>
        </PanGestureHandler>
      </GestureHandlerRootView>
    );
  }

  function NestedHandlers({ eventHandlers }: EventHandlersProps) {
    const handlers = {
      onBegan: eventHandlers.begin,
      onActivated: eventHandlers.active,
      onEnded: eventHandlers.end,
      onCancelled: eventHandlers.cancel,
      onFailed: eventHandlers.fail,
      onGestureEvent: eventHandlers.active,
    };
    return (
      <GestureHandlerRootView>
        <PanGestureHandler testID="pan" {...handlers}>
          <View>
            <Text>Pan handler</Text>
            <RotationGestureHandler testID="rotation" {...handlers}>
              <Text>Rotation handler</Text>
            </RotationGestureHandler>
          </View>
        </PanGestureHandler>
      </GestureHandlerRootView>
    );
  }

  test('receives events', () => {
    const handlers = mockedEventHandlers();
    const { getByTestId } = render(<SingleHandler eventHandlers={handlers} />);
    fireGestureHandler<PanGestureHandler>(getByTestId('pan'), [
      { oldState: State.UNDETERMINED, state: State.BEGAN },
      { oldState: State.BEGAN, state: State.ACTIVE },
      { oldState: State.ACTIVE, state: State.ACTIVE },
      { oldState: State.ACTIVE, state: State.END },
    ]);
    expect(handlers.begin).toHaveBeenCalled();
    expect(handlers.active).toHaveBeenCalled();
    expect(handlers.end).toHaveBeenCalled();
    expect(handlers.cancel).not.toHaveBeenCalled();
    expect(handlers.fail).not.toHaveBeenCalled();
  });

  test('receives events correct number of times', () => {
    const handlers = mockedEventHandlers();
    const { getByTestId } = render(<SingleHandler eventHandlers={handlers} />);
    fireGestureHandler<PanGestureHandler>(getByTestId('pan'), [
      { oldState: State.UNDETERMINED, state: State.BEGAN },
      { oldState: State.BEGAN, state: State.ACTIVE },
      { oldState: State.ACTIVE, state: State.ACTIVE }, // gesture event
      { oldState: State.ACTIVE, state: State.END },
    ]);
    expect(handlers.begin).toHaveBeenCalledTimes(1);
    expect(handlers.active).toHaveBeenCalledTimes(2);
    expect(handlers.end).toHaveBeenCalledTimes(1);
    expect(handlers.cancel).not.toHaveBeenCalled();
    expect(handlers.fail).not.toHaveBeenCalled();
  });

  test('receives events with correct base fields (state, oldState, numberOfPointers, handlerTag)', () => {
    const handlers = mockedEventHandlers();
    const { getByTestId } = render(<SingleHandler eventHandlers={handlers} />);
    const component = getByTestId('pan');

    const COMMON_EVENT_DATA = {
      numberOfPointers: 3,
      handlerTag: component.props.handlerTag as number,
    };
    fireGestureHandler<PanGestureHandler>(component, [
      {
        ...COMMON_EVENT_DATA,
        oldState: State.UNDETERMINED,
        state: State.BEGAN,
      }, // BEGIN - state change
      { ...COMMON_EVENT_DATA, oldState: State.BEGAN, state: State.ACTIVE },
      { ...COMMON_EVENT_DATA, state: State.ACTIVE }, // gesture event
    ]);

    // gesture state change
    expect(handlers.begin).toHaveBeenLastCalledWith({
      nativeEvent: expect.objectContaining({
        ...COMMON_EVENT_DATA,
        oldState: State.UNDETERMINED,
        state: State.BEGAN,
      }),
    });

    // last ACTIVE gesture event, without `oldState`
    expect(handlers.active).toHaveBeenLastCalledWith({
      nativeEvent: expect.objectContaining({
        ...COMMON_EVENT_DATA,
        state: State.ACTIVE,
      }),
    });
    expect(handlers.active).toHaveBeenLastCalledWith({
      nativeEvent: expect.not.objectContaining({
        oldState: expect.any(Number),
      }),
    });
  });

  test.each([
    [
      'pan',
      {
        translationY: 800,
        velocityY: 2,
      },
      {
        translationX: 100,
      },
    ],
    [
      'rotation',
      {
        anchorY: 0,
        rotation: 3.14,
      },
      { numberOfPointers: 2 },
    ],
  ])(
    'receives additional properties depending on handler type ("%s")',
    (
      handlerName: string,
      additionalEventData: Record<string, unknown>,
      defaultEventData: Record<string, unknown>
    ) => {
      const handlers = mockedEventHandlers();
      const { getByTestId } = render(
        <NestedHandlers eventHandlers={handlers} />
      );

      fireGestureHandler(getByTestId(handlerName), [
        {
          ...additionalEventData,
          oldState: State.UNDETERMINED,
          state: State.BEGAN,
        },
        {
          ...additionalEventData,
          oldState: State.BEGAN,
          state: State.ACTIVE,
        },
      ]);

      expect(handlers.begin).toHaveBeenLastCalledWith({
        nativeEvent: expect.objectContaining({
          ...additionalEventData,
          ...defaultEventData,
        }),
      });
    }
  );
});

describe('Using Reanimated 2 useAnimatedGestureHandler hook', () => {
  function UseAnimatedGestureHandler({ eventHandlers }: EventHandlersProps) {
    const eventHandler =
      useAnimatedGestureHandler<LongPressGestureHandlerGestureEvent>({
        onStart: eventHandlers.begin,
      });
    return (
      <LongPressGestureHandler
        testID="longPress"
        onHandlerStateChange={eventHandler}>
        <Text>Long press handler</Text>
      </LongPressGestureHandler>
    );
  }

  test('calls callback with (event data, context)', () => {
    const handlers = mockedEventHandlers();
    const { getByTestId } = render(
      <UseAnimatedGestureHandler eventHandlers={handlers} />
    );

    fireGestureHandler<LongPressGestureHandler>(getByTestId('longPress'), [
      { state: State.BEGAN },
      { state: State.ACTIVE },
      { state: State.END },
    ]);

    expect(handlers.begin).toHaveBeenCalledWith(
      expect.objectContaining({ state: State.BEGAN }),
      expect.any(Object)
    );
  });
});

describe('Using RNGH v2 gesture API', () => {
  interface SingleHandlerProps {
    handlers: ReturnType<typeof mockedEventHandlers>;
    treatStartAsUpdate?: boolean;
  }

  function SingleHandler({ handlers, treatStartAsUpdate }: SingleHandlerProps) {
    const pan = Gesture.Pan()
      .onBegin(handlers.begin)
      .onStart(treatStartAsUpdate ? handlers.active : handlers.start)
      .onUpdate(handlers.active)
      .onEnd(handlers.end)
      .onFinalize(handlers.finish)
      .withTestId('pan');

    return (
      <GestureHandlerRootView>
        <GestureDetector gesture={pan}>
          <Text>v2 API test</Text>
        </GestureDetector>
      </GestureHandlerRootView>
    );
  }

  interface RacingHandlersProps {
    tapHandlers: ReturnType<typeof mockedEventHandlers>;
    panHandlers: ReturnType<typeof mockedEventHandlers>;
  }

  function RacingHandlers({ tapHandlers, panHandlers }: RacingHandlersProps) {
    const tap = Gesture.Tap()
      .onBegin(tapHandlers.begin)
      .onEnd(tapHandlers.end)
      .withTestId('tap');

    const pan = Gesture.Pan()
      .onBegin(panHandlers.begin)
      .onUpdate(panHandlers.active)
      .onEnd(panHandlers.end)
      .onFinalize(panHandlers.finish)
      .withTestId('pan');

    return (
      <GestureHandlerRootView>
        <GestureDetector gesture={Gesture.Race(tap, pan)}>
          <Text>v2 API test</Text>
        </GestureDetector>
      </GestureHandlerRootView>
    );
  }

  test('sends events to handlers', () => {
    const tapHandlers = mockedEventHandlers();
    const panHandlers = mockedEventHandlers();
    render(
      <RacingHandlers tapHandlers={tapHandlers} panHandlers={panHandlers} />
    );

    fireGestureHandler<PanGesture>(getByGestureTestId('pan'), [
      { state: State.BEGAN },
      { state: State.ACTIVE },
      { state: State.END },
    ]);
    expect(panHandlers.begin).toHaveBeenCalledWith(
      expect.objectContaining({ state: State.BEGAN })
    );
    expect(panHandlers.finish).toHaveBeenCalled();
    expect(tapHandlers.begin).not.toHaveBeenCalled();
  });

  test('sends events with additional data to handlers', () => {
    const panHandlers = mockedEventHandlers();
    render(<SingleHandler handlers={panHandlers} treatStartAsUpdate />);
    fireGestureHandler<PanGesture>(getByGestureTestId('pan'), [
      { state: State.BEGAN, translationX: 0 },
      { state: State.ACTIVE, translationX: 10 },
      { translationX: 20 },
      { translationX: 20 },
      { state: State.END, translationX: 30 },
    ]);

    expect(panHandlers.active).toHaveBeenCalledTimes(3);
    expect(panHandlers.active).toHaveBeenLastCalledWith(
      expect.objectContaining({ translationX: 20 })
    );
  });
});

describe('Event list validation', () => {
  interface SingleHandlerProps {
    handlers: ReturnType<typeof mockedEventHandlers>;
    treatStartAsUpdate?: boolean;
  }

  function SingleHandler({ handlers, treatStartAsUpdate }: SingleHandlerProps) {
    const pan = Gesture.Pan()
      .onBegin(handlers.begin)
      .onStart(treatStartAsUpdate ? handlers.active : handlers.start)
      .onUpdate(handlers.active)
      .onEnd(handlers.end)
      .onFinalize(handlers.finish)
      .withTestId('pan');

    return (
      <GestureHandlerRootView>
        <GestureDetector gesture={pan}>
          <Text>v2 API test</Text>
        </GestureDetector>
      </GestureHandlerRootView>
    );
  }

  test("throws error when oldState doesn't correspond to previous event's state", () => {
    const panHandlers = mockedEventHandlers();
    render(<SingleHandler handlers={panHandlers} />);
    expect(() => {
      fireGestureHandler<PanGesture>(getByGestureTestId('pan'), [
        { oldState: State.UNDETERMINED, state: State.BEGAN, x: 0, y: 10 },
        { oldState: State.UNDETERMINED, state: State.ACTIVE, x: 1, y: 11 },
      ]);
    }).toThrow(
      "when state changes, oldState should be the same as previous event' state"
    );
  });

  test.each([[State.END], [State.FAILED], [State.CANCELLED]])(
    'correctly handles events ending with state %s',
    (lastState) => {
      const panHandlers = mockedEventHandlers();
      render(<SingleHandler handlers={panHandlers} />);
      fireGestureHandler<PanGesture>(getByGestureTestId('pan'), [
        { state: State.BEGAN },
        { state: State.ACTIVE },
        { state: lastState },
      ]);

      if (lastState === State.END) {
        expect(panHandlers.end).toHaveBeenCalled();
      } else {
        expect(panHandlers.finish).toHaveBeenCalledWith(
          expect.any(Object),
          false
        );
      }
    }
  );
});

describe('Filling event list with defaults', () => {
  interface RacingTapAndPanProps {
    handlers: ReturnType<typeof mockedEventHandlers>;
    treatStartAsUpdate?: boolean;
  }

  function RacingTapAndPan({
    handlers,
    treatStartAsUpdate,
  }: RacingTapAndPanProps) {
    const tap = Gesture.Tap()
      .onBegin(handlers.begin)
      .onEnd(handlers.end)
      .withTestId('tap');

    const pan = Gesture.Pan()
      .onBegin(handlers.begin)
      .onStart(treatStartAsUpdate ? handlers.active : handlers.start)
      .onUpdate(handlers.active)
      .onEnd(handlers.end)
      .onFinalize(handlers.finish)
      .withTestId('pan');

    return (
      <GestureHandlerRootView>
        <GestureDetector gesture={Gesture.Exclusive(pan, tap)}>
          <Text>v2 API test</Text>
        </GestureDetector>
      </GestureHandlerRootView>
    );
  }

  test('fills oldState if not passed', () => {
    const handlers = mockedEventHandlers();
    render(<RacingTapAndPan handlers={handlers} treatStartAsUpdate />);
    fireGestureHandler<PanGestureHandler>(getByGestureTestId('pan'), [
      { state: State.BEGAN },
      { state: State.ACTIVE },
      { state: State.ACTIVE },
      { state: State.ACTIVE },
      { state: State.END },
    ]);

    expect(handlers.begin).toHaveBeenCalledWith(
      expect.objectContaining({ oldState: State.UNDETERMINED })
    );
    expect(handlers.active).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ oldState: State.BEGAN })
    );
    expect(handlers.active).toHaveBeenLastCalledWith(
      expect.not.objectContaining({ oldState: expect.anything() })
    );
    expect(handlers.end).toHaveBeenCalledWith(
      expect.objectContaining({ oldState: State.ACTIVE }),
      true
    );
  });

  test('fills missing ACTIVE states', () => {
    const panHandlers = mockedEventHandlers();
    render(<RacingTapAndPan handlers={panHandlers} treatStartAsUpdate />);
    fireGestureHandler<PanGesture>(getByGestureTestId('pan'), [
      { state: State.BEGAN, x: 0, y: 10 },
      { state: State.ACTIVE, x: 1, y: 11 },
      { x: 2, y: 12 },
      { x: 3, y: 13 },
      { state: State.END, x: 4, y: 14 },
    ]);

    expect(panHandlers.active).toHaveBeenCalledTimes(3);
    expect(panHandlers.active).toHaveBeenLastCalledWith(
      expect.objectContaining({ x: 3, y: 13 })
    );
  });

  test('fills BEGIN and END events for discrete handlers', () => {
    const handlers = mockedEventHandlers();
    render(<RacingTapAndPan handlers={handlers} treatStartAsUpdate />);
    fireGestureHandler<TapGesture>(getByGestureTestId('tap'), [{ x: 5 }]);
    expect(handlers.begin).toHaveBeenCalledTimes(1);
    expect(handlers.end).toHaveBeenCalledTimes(1);
  });

  test('with FAILED event, fills BEGIN event for discrete handlers', () => {
    const handlers = mockedEventHandlers();
    render(<RacingTapAndPan handlers={handlers} treatStartAsUpdate />);
    fireGestureHandler<TapGesture>(getByGestureTestId('tap'), [
      { state: State.FAILED },
    ]);
    expect(handlers.begin).toHaveBeenCalledTimes(1);
    expect(handlers.end).toHaveBeenCalledTimes(1);
    expect(handlers.end).toHaveBeenCalledWith(expect.anything(), false);
  });

  test('uses event data from first event in filled BEGIN, ACTIVE events', () => {
    const handlers = mockedEventHandlers();
    render(<RacingTapAndPan handlers={handlers} treatStartAsUpdate />);
    fireGestureHandler<PanGesture>(getByGestureTestId('pan'), [{ x: 120 }]);
    expect(handlers.begin).toHaveBeenCalledWith(
      expect.objectContaining({ x: 120 })
    );
    expect(handlers.active).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ x: 120 })
    );
  });

  test('uses event data from last event in filled END events', () => {
    const handlers = mockedEventHandlers();
    render(<RacingTapAndPan handlers={handlers} treatStartAsUpdate />);
    fireGestureHandler<PanGesture>(getByGestureTestId('pan'), [
      { x: 120, state: State.FAILED },
    ]);
    expect(handlers.begin).toHaveBeenCalledTimes(1);
    expect(handlers.active).toHaveBeenCalledTimes(1);
    expect(handlers.end).toHaveBeenCalledWith(
      expect.objectContaining({ x: 120 }),
      false
    );
  });

  test('uses event data filled events', () => {
    const handlers = mockedEventHandlers();
    render(<RacingTapAndPan handlers={handlers} treatStartAsUpdate />);
    fireGestureHandler<PanGesture>(getByGestureTestId('pan'), [
      { x: 5, y: 15 },
      { x: 6, y: 16 },
      { x: 7, y: 17 },
    ]);
    expect(handlers.begin).toHaveBeenCalledWith(
      expect.objectContaining({ x: 5, y: 15 })
    );
    expect(handlers.active).toHaveBeenCalledTimes(3);
    expect(handlers.end).toHaveBeenCalledWith(
      expect.objectContaining({ x: 7, y: 17 }),
      true
    );
  });

  test("fills BEGIN and END events when they're not present, for discrete handlers", () => {
    const handlers = mockedEventHandlers();
    render(<RacingTapAndPan handlers={handlers} treatStartAsUpdate />);
    fireGestureHandler<TapGesture>(getByGestureTestId('tap'));
    expect(handlers.begin).toHaveBeenCalledTimes(1);
    expect(handlers.end).toHaveBeenCalledTimes(1);
  });

  test("fills BEGIN, ACTIVE and END events when they're not present, for continuous handlers", () => {
    const handlers = mockedEventHandlers();
    render(<RacingTapAndPan handlers={handlers} treatStartAsUpdate />);
    fireGestureHandler<PanGesture>(getByGestureTestId('pan'));
    expect(handlers.begin).toHaveBeenCalledTimes(1);
    expect(handlers.active).toHaveBeenCalledTimes(1);
    expect(handlers.end).toHaveBeenCalledTimes(1);
  });
});
