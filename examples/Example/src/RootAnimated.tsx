import React, { useRef } from 'react';
import { findNodeHandle } from 'react-native';
import Animated, { runOnJS, useEvent } from 'react-native-reanimated';
import {
  GestureHandlerModule,
  findHandler,
} from 'react-native-gesture-handler';

export const RootAnimated = (props) => {
  const callback = (e) => {
    const gesture = findHandler(e.handlerTag);

    if (gesture) {
      if (e.oldState || e.oldState == 0) {
        if (e.oldState == 0 && e.state == 2) {
          gesture.config.onBegan?.(e);
        } else if (e.oldState == 2 && e.state == 4) {
          gesture.config.onStart?.(e);
        } else if (e.oldState == 4 && e.state == 5) {
          gesture.config.onEnd?.(e, true);
        } else if (e.state == 1) {
          gesture.config.onEnd?.(e, false);
        } else if (e.state == 3) {
          gesture.config.onEnd?.(e, false);
        }
      } else {
        gesture.config.onUpdate?.(e);
      }
    }
  };

  const handler = (event) => {
    'worklet';

    runOnJS(callback)(event);
  };

  const event = useEvent(
    handler,
    ['onGestureHandlerStateChange', 'onGestureHandlerEvent'],
    false
  );

  let inner = useRef();

  const sendEvent = (event, name) => {
    event.stopPropagation();

    if (!event.nativeEvent.ignore)
      GestureHandlerModule.dispatchEvent(
        name,
        findNodeHandle(inner.current) as number,
        { ...event.nativeEvent, ignore: true }
      );
  };

  return (
    <Animated.View
      onGestureHandlerEvent={(e) => {
        sendEvent(e, 'onGestureHandlerEvent');
      }}
      onGestureHandlerStateChange={(e) => {
        sendEvent(e, 'onGestureHandlerStateChange');
      }}>
      <Animated.View ref={inner} onGestureHandlerEvent={event}>
        {props.children}
      </Animated.View>
    </Animated.View>
  );
};
