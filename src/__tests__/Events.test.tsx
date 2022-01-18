import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
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
  PanGestureHandlerEventPayload,
  HandlerStateChangeEventPayload,
} from '../index';
import { not, useAnimatedGestureHandler } from 'react-native-reanimated';
import { fireGestureHandlerEvent } from '../jestUtils';

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

function V1Api({ eventHandlers }: V1ApiProps) {
  const eventHandler = useAnimatedGestureHandler({
    onStart: eventHandlers.begin,
    onFinish: eventHandlers.finish,
    onActive: eventHandlers.active,
    onEnd: eventHandlers.end,
    onCancel: eventHandlers.cancel,
    onFail: eventHandlers.fail,
  });
  return (
    <GestureHandlerRootView>
      <TapGestureHandler testID="tap" onHandlerStateChange={eventHandler}>
        <Text>Tap handler</Text>
      </TapGestureHandler>

      <PanGestureHandler
        testID="pan"
        onHandlerStateChange={eventHandler}
        onGestureEvent={eventHandler}>
        <Text>Pan handler</Text>
      </PanGestureHandler>

      <LongPressGestureHandler
        testID="longPress"
        onHandlerStateChange={eventHandler}>
        <Text>Long press handler</Text>
      </LongPressGestureHandler>

      <RotationGestureHandler
        testID="rotation"
        onHandlerStateChange={eventHandler}>
        <Text>Rotation handler</Text>
      </RotationGestureHandler>

      <FlingGestureHandler testID="fling" onHandlerStateChange={eventHandler}>
        <Text>Fling handler</Text>
      </FlingGestureHandler>

      <PinchGestureHandler testID="pinch" onHandlerStateChange={eventHandler}>
        <Text>Pinch handler</Text>
      </PinchGestureHandler>

      <PanGestureHandler
        testID="pan-nested"
        onHandlerStateChange={eventHandler}>
        <View>
          <Text>Nested gesture handlers - outside</Text>
          <TapGestureHandler
            testID="tap-nested"
            onHandlerStateChange={eventHandler}>
            <Text>Nested gesture handlers - inside</Text>
          </TapGestureHandler>
        </View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
}

const V2Api = ({ eventHandlers }: V1ApiProps) => {
  const tap = Gesture.Tap()
    .onBegin(eventHandlers.begin)
    .onEnd(eventHandlers.end)
    .withTestId('tap');

  const pan = Gesture.Pan()
    .onBegin(eventHandlers.begin)
    .onUpdate(eventHandlers.active)
    .onEnd(eventHandlers.end)
    .withTestId('pan');

  return (
    <GestureHandlerRootView>
      <GestureDetector gesture={Gesture.Race(tap, pan)}>
        <Text>v2 API test</Text>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

describe('Using base RNGH v1 API', () => {
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

  it('receives events with correct base fields (state, oldState, numberOfPointers, handlerTag)', () => {
    const handlers = mockedEventHandlers();
    const { getByTestId } = render(<SingleHandler eventHandlers={handlers} />);

    const COMMON_EVENT_DATA = {
      numberOfPointers: 3,
      handlerTag: 5,
    };
    fireGestureHandlerEvent(getByTestId('pan'), [
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
      }) as Record<string, unknown>,
    });

    // last ACTIVE gesture event, without `oldState`
    expect(handlers.active).lastCalledWith({
      nativeEvent: expect.objectContaining({
        ...COMMON_EVENT_DATA,
        state: State.ACTIVE,
      }) as Record<string, unknown>,
    });
    expect(handlers.active).lastCalledWith({
      nativeEvent: expect.not.objectContaining({
        oldState: expect.any(Number) as number,
      }) as Record<string, unknown>,
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
        }) as Record<string, unknown>,
      });
    }
  );
});

// TODO

// v1
// v2

// Tap
// Pan
// Long press
// Rotation
// Fling
// Pinch
// Nested

// begin: () => void;
// progress: () => void;
// end: () => void;
// fail: () => void;
// cancel: () => void;
// finish: () => void;

// .toHaveBeenCalledTimes(number)
// .toHaveBeenCalledWith(arg1, arg2, ...)

it.todo('calls begin callback only once');
it.todo(
  'calls active callback times that correspond to event data list length - 1'
);
it.todo('calls callback that was specified in `type` param');
it.todo("can't call fail and end simultaneously");

// test('API v2', () => {
//   const eventFunctions = mockEventFunctions();
//   render(<AppAPIv2 eventFunctions={eventFunctions} />);
//   fireTapGestureHandler(1);
//   firePanGestureHandler(2);
//   expect(eventFunctions.begin).toHaveBeenCalledTimes(2);
//   expect(eventFunctions.progress).toHaveBeenCalledTimes(2);
// });
