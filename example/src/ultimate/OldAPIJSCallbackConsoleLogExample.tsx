import { Text, View } from 'react-native';

import React from 'react';
import { PanGestureHandler } from 'react-native-gesture-handler';

declare const _WORKLET: boolean; // from react-native-reanimated

export function OldAPIJSCallbackConsoleLogExample() {
  const onGestureEvent = () => {
    console.log(_WORKLET, 'onGestureEvent');
  };

  const onHandlerStateChange = () => {
    console.log(_WORKLET, 'onHandlerStateChange');
  };

  return (
    <View>
      <Text>Old API / JS callback / console.log</Text>
      <View
        style={{ height: 60, alignItems: 'center', justifyContent: 'center' }}>
        <PanGestureHandler
          maxPointers={1}
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}>
          <View
            style={{
              width: 50,
              height: 50,
              backgroundColor: 'cyan',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />
        </PanGestureHandler>
      </View>
    </View>
  );
}
