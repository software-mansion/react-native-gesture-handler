import { Text, View } from 'react-native';

import React from 'react';
import {
  PanGestureHandler,
  PanGestureHandlerStateChangeEvent,
  PanGestureHandlerGestureEvent,
  State,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

declare const _WORKLET: boolean; // from react-native-reanimated

export function OldAPIJSCallbackUpdateSharedValueExample() {
  const drag = useSharedValue(0);
  const isPressed = useSharedValue(false);

  const onGestureEvent = (event: PanGestureHandlerGestureEvent) => {
    drag.value = event.nativeEvent.translationX;
    console.log(_WORKLET, 'onGestureEvent');
  };

  const onHandlerStateChange = (event: PanGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.state === State.BEGAN) {
      isPressed.value = true;
    } else if (
      event.nativeEvent.state === State.FAILED ||
      event.nativeEvent.state === State.CANCELLED ||
      event.nativeEvent.state === State.END
    ) {
      drag.value = withSpring(0, { velocity: event.nativeEvent.velocityX });
      isPressed.value = false;
    }
    console.log(_WORKLET, 'onHandlerStateChange');
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: drag.value }],
      backgroundColor: isPressed.value ? 'black' : 'lightgray',
    };
  });

  return (
    <View>
      <Text>Old API / JS callback / update shared value</Text>
      <View
        style={{ height: 60, alignItems: 'center', justifyContent: 'center' }}>
        <PanGestureHandler
          maxPointers={1}
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}>
          <Animated.View
            style={[
              {
                width: 50,
                height: 50,
                alignItems: 'center',
                justifyContent: 'center',
              },
              animatedStyle,
            ]}
          />
        </PanGestureHandler>
      </View>
    </View>
  );
}
