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
} from '../index';
import { useAnimatedGestureHandler } from 'react-native-reanimated';

const mockEventFunctions = () => {
  return {
    begin: jest.fn(),
    progress: jest.fn(),
    end: jest.fn(),
    fail: jest.fn(),
    cancel: jest.fn(),
    finish: jest.fn(),
  };
};

interface V1ApiProps {
  eventFunctions: {
    begin: () => void;
    progress: () => void;
    end: () => void;
  };
}

function V1Api({ eventFunctions: { begin, progress, end } }: V1ApiProps) {
  const eventHandler = useAnimatedGestureHandler({
    onStart: begin,
    onActive: progress,
    onEnd: end,
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

const V2Api = ({ eventFunctions: { begin, progress, end } }: AppProps) => {
  const tap = Gesture.Tap().onBegin(begin).onEnd(end).withTestId('tap');

  const pan = Gesture.Pan()
    .onBegin(begin)
    .onUpdate(progress)
    .onEnd(end)
    .withTestId('pan');

  return (
    <GestureHandlerRootView>
      <GestureDetector gesture={Gesture.Race(tap, pan)}>
        <Text>v2 API test</Text>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

// eslint-disable-next-line jest/expect-expect
it('receives events', () => {
  const events = mockEventFunctions();
  const { getByTestId } = render(<V1Api eventFunctions={events} />);
  fireEvent(getByTestId('tap'), 'onGestureHandlerEvent', {});
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
