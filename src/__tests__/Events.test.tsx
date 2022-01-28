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
  RotationGestureHandler,
  Gesture,
  GestureDetector,
  State,
  PanGesture,
} from '../index';
import { useAnimatedGestureHandler } from 'react-native-reanimated';
import { fireGestureHandler, getByHandlerId } from '../jestUtils';

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

  it('receives events', () => {
    const handlers = mockedEventHandlers();
    const { getByTestId } = render(<SingleHandler eventHandlers={handlers} />);
    fireGestureHandler<PanGestureHandler>(getByTestId('pan'), [
      { oldState: State.UNDETERMINED, state: State.BEGAN },
      { oldState: State.BEGAN, state: State.ACTIVE },
      { oldState: State.ACTIVE, state: State.ACTIVE },
      { oldState: State.ACTIVE, state: State.END },
    ]);
    expect(handlers.begin).toBeCalled();
    expect(handlers.active).toBeCalled();
    expect(handlers.end).toBeCalled();
    expect(handlers.cancel).not.toBeCalled();
    expect(handlers.fail).not.toBeCalled();
  });

  it('receives events correct number of times', () => {
    const handlers = mockedEventHandlers();
    const { getByTestId } = render(<SingleHandler eventHandlers={handlers} />);
    fireGestureHandler<PanGestureHandler>(getByTestId('pan'), [
      { oldState: State.UNDETERMINED, state: State.BEGAN },
      { oldState: State.BEGAN, state: State.ACTIVE },
      { oldState: State.ACTIVE, state: State.ACTIVE }, // gesture event
      { oldState: State.ACTIVE, state: State.END },
    ]);
    expect(handlers.begin).toBeCalledTimes(1);
    expect(handlers.active).toBeCalledTimes(2);
    expect(handlers.end).toBeCalledTimes(1);
    expect(handlers.cancel).not.toBeCalled();
    expect(handlers.fail).not.toBeCalled();
  });

  it('receives events with correct base fields (state, oldState, numberOfPointers, handlerTag)', () => {
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
    expect(handlers.begin).lastCalledWith({
      nativeEvent: expect.objectContaining({
        ...COMMON_EVENT_DATA,
        oldState: State.UNDETERMINED,
        state: State.BEGAN,
      }),
    });

    // last ACTIVE gesture event, without `oldState`
    expect(handlers.active).lastCalledWith({
      nativeEvent: expect.objectContaining({
        ...COMMON_EVENT_DATA,
        state: State.ACTIVE,
      }),
    });
    expect(handlers.active).lastCalledWith({
      nativeEvent: expect.not.objectContaining({
        oldState: expect.any(Number),
      }),
    });
  });

  it.each([
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

      expect(handlers.begin).lastCalledWith({
        nativeEvent: expect.objectContaining({
          ...additionalEventData,
          ...defaultEventData,
        }),
      });
    }
  );

  it('fills oldState if not passed', () => {
    const handlers = mockedEventHandlers();
    const { getByTestId } = render(<SingleHandler eventHandlers={handlers} />);
    fireGestureHandler<PanGestureHandler>(getByTestId('pan'), [
      { state: State.BEGAN },
      { state: State.ACTIVE },
      { state: State.ACTIVE },
      { state: State.ACTIVE },
      { state: State.END },
    ]);

    expect(handlers.begin).toBeCalledWith({
      nativeEvent: expect.objectContaining({ oldState: State.UNDETERMINED }),
    });
    expect(handlers.active).nthCalledWith(1, {
      nativeEvent: expect.objectContaining({ oldState: State.BEGAN }),
    });
    expect(handlers.active).lastCalledWith({
      nativeEvent: expect.not.objectContaining({ oldState: expect.anything() }),
    });
    expect(handlers.end).toBeCalledWith({
      nativeEvent: expect.objectContaining({ oldState: State.ACTIVE }),
    });
  });
});

describe('Using Reanimated 2 useAnimatedGestureHandler hook', () => {
  function UseAnimatedGestureHandler({ eventHandlers }: EventHandlersProps) {
    const eventHandler = useAnimatedGestureHandler({
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

  it('calls callback with (event data, context)', () => {
    const handlers = mockedEventHandlers();
    const { getByTestId } = render(
      <UseAnimatedGestureHandler eventHandlers={handlers} />
    );

    fireGestureHandler<LongPressGestureHandler>(getByTestId('longPress'), [
      { state: State.BEGAN },
      { state: State.ACTIVE },
      { state: State.END },
    ]);

    expect(handlers.begin).toBeCalledWith(
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

  it('sends events to handlers', () => {
    const tapHandlers = mockedEventHandlers();
    const panHandlers = mockedEventHandlers();
    render(
      <RacingHandlers tapHandlers={tapHandlers} panHandlers={panHandlers} />
    );

    fireGestureHandler<PanGesture>(getByHandlerId('pan'), [
      { state: State.BEGAN },
      { state: State.ACTIVE },
      { state: State.END },
    ]);
    expect(panHandlers.begin).toBeCalledWith(
      expect.objectContaining({ state: State.BEGAN })
    );
    expect(panHandlers.finish).toBeCalled();
    expect(tapHandlers.begin).not.toBeCalled();
  });

  it('sends events with additional data to handlers', () => {
    const panHandlers = mockedEventHandlers();
    render(<SingleHandler handlers={panHandlers} treatStartAsUpdate />);
    fireGestureHandler<PanGesture>(getByHandlerId('pan'), [
      { state: State.BEGAN, translationX: 0 },
      { state: State.ACTIVE, translationX: 10 },
      { translationX: 20 },
      { translationX: 20 },
      { state: State.END, translationX: 30 },
    ]);

    expect(panHandlers.active).toBeCalledTimes(3);
    expect(panHandlers.active).toHaveBeenLastCalledWith(
      expect.objectContaining({ translationX: 20 })
    );
  });

  it("uses last state if next event doesn't specify it and state transition is valid", () => {
    const panHandlers = mockedEventHandlers();
    render(<SingleHandler handlers={panHandlers} treatStartAsUpdate />);
    fireGestureHandler<PanGesture>(getByHandlerId('pan'), [
      { state: State.BEGAN, x: 0, y: 10 },
      { state: State.ACTIVE, x: 1, y: 11 },
      { x: 2, y: 12 },
      { x: 3, y: 13 },
      { state: State.END, x: 4, y: 14 },
    ]);

    expect(panHandlers.active).toBeCalledTimes(3);
    expect(panHandlers.active).toHaveBeenLastCalledWith(
      expect.objectContaining({ x: 3, y: 13 })
    );
  });

  it("throws error when oldState doesn't correspond to previous event's state", () => {
    const panHandlers = mockedEventHandlers();
    render(<SingleHandler handlers={panHandlers} />);
    expect(() => {
      fireGestureHandler<PanGesture>(getByHandlerId('pan'), [
        { oldState: State.UNDETERMINED, state: State.BEGAN, x: 0, y: 10 },
        { oldState: State.UNDETERMINED, state: State.ACTIVE, x: 1, y: 11 },
      ]);
    }).toThrow(
      "when state changes, oldState should be the same as previous event' state"
    );
  });

  it("throws error when first state isn't the BEGIN event", () => {
    const panHandlers = mockedEventHandlers();
    render(<SingleHandler handlers={panHandlers} />);

    expect(() => {
      fireGestureHandler<PanGesture>(getByHandlerId('pan'), [
        { state: State.ACTIVE, x: 0, y: 10 },
        { state: State.ACTIVE, x: 1, y: 11 },
      ]);
    }).toThrow('first event must have BEGAN state');
  });

  it.each([[State.END], [State.FAILED], [State.CANCELLED]])(
    'correctly handles events ending with state %s',
    (lastState) => {
      const panHandlers = mockedEventHandlers();
      render(<SingleHandler handlers={panHandlers} />);
      fireGestureHandler<PanGesture>(getByHandlerId('pan'), [
        { state: State.BEGAN },
        { state: State.ACTIVE },
        { state: lastState },
      ]);

      if (lastState === State.END) {
        expect(panHandlers.end).toBeCalled();
      } else {
        expect(panHandlers.finish).toBeCalledWith(expect.any(Object), false);
      }
    }
  );
});
