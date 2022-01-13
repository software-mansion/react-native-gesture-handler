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
  GestureDetector
} from 'react-native-gesture-handler';
import { 
  fireTapGestureHandler,
  firePanGestureHandler,
  fireLongPressGestureHandler,
  fireRotationGestureHandler,
  fireFlingGestureHandler,
  firePinchGestureHandler,
  EventDataTypeV1,
  resetGestureHandlerRegistry
} from '../src/jestUtils'
import { useAnimatedGestureHandler } from 'react-native-reanimated';

beforeEach(() => {
  resetGestureHandlerRegistry();
})

const mockEventFunctions = () => {
  return {
    begin: jest.fn(), 
    progress: jest.fn(), 
    end: jest.fn(),
    fail: jest.fn(),
    cancel: jest.fn(),
    finish: jest.fn()
  };
}

const assertEventCalls = (eventFunctions, counts) => {
  expect(eventFunctions.begin).toHaveBeenCalledTimes(
    counts?.begin !== undefined ? counts.begin : 1
  );
  expect(eventFunctions.progress).toHaveBeenCalledTimes(
    counts?.progress !== undefined ? counts.progress : 1
  );
  expect(eventFunctions.end).toHaveBeenCalledTimes(
    counts?.end !== undefined ? counts.end : 1
  );
}

const App = (props) => {
  const eventHandler = useAnimatedGestureHandler({
    onStart: () => props.eventFunctions.begin(),
    onActive: () => props.eventFunctions.progress(),
    onEnd: () => props.eventFunctions.end()
  });

  return (
    <GestureHandlerRootView>
      <TapGestureHandler testId={1} onHandlerStateChange={eventHandler}>
        <Text>TapGestureHandlerTest</Text>
      </TapGestureHandler>

      <PanGestureHandler testId={2} onHandlerStateChange={eventHandler} onGestureEvent={eventHandler}>
        <Text>PanGestureHandlerTest</Text>
      </PanGestureHandler>

      <LongPressGestureHandler testId={3} onHandlerStateChange={eventHandler}>
        <Text>LongPressGestureHandlerTest</Text>
      </LongPressGestureHandler>
      
      <RotationGestureHandler testId={4} onHandlerStateChange={eventHandler}>
        <Text>RotationGestureHandlerTest</Text>
      </RotationGestureHandler>

      <FlingGestureHandler testId={5} onHandlerStateChange={eventHandler}>
        <Text>FlingGestureHandlerTest</Text>
      </FlingGestureHandler>

      <PinchGestureHandler testId={6} onHandlerStateChange={eventHandler}>
        <Text>PinchGestureHandlerTest</Text>
      </PinchGestureHandler>

      <PanGestureHandler testId={7} onHandlerStateChange={eventHandler}>
        <View>
          <Text>NestedGestureHandlerTest1</Text>
          <TapGestureHandler testId={8} onHandlerStateChange={eventHandler}>
            <Text>NestedGestureHandlerTest2</Text>
          </TapGestureHandler>
        </View>
      </PanGestureHandler>

    </GestureHandlerRootView>
  );
};

test('test fireTapGestureHandler', () => {
  const eventFunctions = mockEventFunctions();
  render(<App eventFunctions={eventFunctions} />);
  fireTapGestureHandler(1, 
    [
      {x: 1, y: 1}, 
      {x: 2, y: 2},
      {x: 4, y: 4, type: EventDataTypeV1.onCancel}
    ]
  );
  assertEventCalls(eventFunctions);
});

test('test firePanGestureHandler', () => {
  const eventFunctions = mockEventFunctions();
  render(<App eventFunctions={eventFunctions} />);
  firePanGestureHandler(2,
    [{ x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 }, { x: 4, y: 4 }]
  );
  assertEventCalls(eventFunctions, { progress: 3 });
});

test('test fireLongPressGestureHandler', () => {
  const eventFunctions = mockEventFunctions();
  render(<App eventFunctions={eventFunctions} />);
  fireLongPressGestureHandler(3);
  assertEventCalls(eventFunctions);
});

test('test fireRotationGestureHandler', () => {
  const eventFunctions = mockEventFunctions();
  render(<App eventFunctions={eventFunctions} />);
  fireRotationGestureHandler(4);
  assertEventCalls(eventFunctions);
});

test('test fireFlingGestureHandler', () => {
  const eventFunctions = mockEventFunctions();
  render(<App eventFunctions={eventFunctions} />);
  fireFlingGestureHandler(5);
  assertEventCalls(eventFunctions);
});

test('test firePinchGestureHandler', () => {
  const eventFunctions = mockEventFunctions();
  render(<App eventFunctions={eventFunctions} />);
  firePinchGestureHandler(6);
  assertEventCalls(eventFunctions);
});

test('test nestedGestureHandler', () => {
  const eventFunctions = mockEventFunctions();
  render(<App eventFunctions={eventFunctions} />);
  firePanGestureHandler(7);
  firePanGestureHandler(7);
  fireTapGestureHandler(8);
  assertEventCalls(eventFunctions, { begin: 3, progress: 3, end: 3 });
});

const AppAPIv2 = props => {
  const tap = Gesture.Tap()
    .onBegin(() => {
      props.eventFunctions.begin()
    })
    .onEnd(() => {
      props.eventFunctions.progress()
    })
    .withTestId(1);

  const pan = Gesture.Pan()
    .onBegin(() => {
      props.eventFunctions.begin()
    })
    .onEnd(() => {
      props.eventFunctions.progress()
    })
    .withTestId(2);

  return (
    <GestureHandlerRootView>
      <GestureDetector gesture={Gesture.Race(tap, pan)}>
        <View>
          <Text>Text</Text>
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

test('test API v2', () => {
  const eventFunctions = mockEventFunctions();
  render(<AppAPIv2 eventFunctions={eventFunctions} />);
  fireTapGestureHandler(1);
  firePanGestureHandler(2);
  expect(eventFunctions.begin).toHaveBeenCalledTimes(2);
  expect(eventFunctions.progress).toHaveBeenCalledTimes(2);
});
