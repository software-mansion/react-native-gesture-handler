/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// Disabling lint for assymetric matchers, check proposal below
// https://github.com/DefinitelyTyped/DefinitelyTyped/discussions/56937
import React from 'react';
import { render } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import {
  GestureHandlerRootView,
  TapGestureHandler,
  PanGestureHandler,
  LongPressGestureHandler,
  FlingGestureHandler,
  RotationGestureHandler,
  PinchGestureHandler,
  Gesture,
  GestureDetector,
  State,
} from '../index';
import { useAnimatedGestureHandler } from 'react-native-reanimated';
import { fireGestureHandlerEvent, getByHandlerId } from '../jestUtils';
import { cleanup } from '@testing-library/react-native';

beforeEach(cleanup);

const mockedEventHandlers = () => {
  return {
    begin: jest.fn(),
    active: jest.fn(),
    end: jest.fn(),
    fail: jest.fn(),
    cancel: jest.fn(),
    finish: jest.fn(),
  };
};

interface V1ApiProps {
  eventHandlers: ReturnType<typeof mockedEventHandlers>;
}

describe('Using RNGH v1 base API', () => {
  function SingleHandler({ eventHandlers }: V1ApiProps) {
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

  function NestedHandlers({ eventHandlers }: V1ApiProps) {
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
    fireGestureHandlerEvent(getByTestId('pan'), [
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
    fireGestureHandlerEvent(getByTestId('pan'), [
      { oldState: State.UNDETERMINED, state: State.BEGAN }, // state change
      { oldState: State.BEGAN, state: State.ACTIVE }, // state change
      { oldState: State.ACTIVE, state: State.ACTIVE }, // gesture event
      { oldState: State.ACTIVE, state: State.END }, // state change
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
    fireGestureHandlerEvent(component, [
      {
        ...COMMON_EVENT_DATA,
        oldState: State.UNDETERMINED,
        state: State.BEGAN,
      }, // BEGIN - state change
      { ...COMMON_EVENT_DATA, oldState: State.BEGAN, state: State.ACTIVE }, // ACTIVE - state change
      { ...COMMON_EVENT_DATA, state: State.ACTIVE }, // ACTIVE - gesture event
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

      fireGestureHandlerEvent(getByTestId(handlerName), [
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
    fireGestureHandlerEvent(getByTestId('pan'), [
      { state: State.BEGAN }, // state change
      { state: State.ACTIVE }, // state change
      { state: State.ACTIVE }, // gesture event
      { state: State.ACTIVE }, // gesture event
      { state: State.END }, // state change
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
  function UseAnimatedGestureHandler({ eventHandlers }: V1ApiProps) {
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

    fireGestureHandlerEvent(getByTestId('longPress'), [
      { state: State.BEGAN }, // state change
      { state: State.ACTIVE }, // state change
      { state: State.END }, // state change
    ]);

    expect(handlers.begin).toBeCalledWith(
      expect.objectContaining({ state: State.BEGAN }),
      expect.any(Object)
    );
  });
});

describe('Using RNGH v2 gesture API', () => {});

// TODO

// v2

it.todo("can't call fail and end simultaneously");

// test('API v2', () => {
//   const eventFunctions = mockEventFunctions();
//   render(<AppAPIv2 eventFunctions={eventFunctions} />);
//   fireTapGestureHandler(1);
//   firePanGestureHandler(2);
//   expect(eventFunctions.begin).toHaveBeenCalledTimes(2);
//   expect(eventFunctions.progress).toHaveBeenCalledTimes(2);
// });
