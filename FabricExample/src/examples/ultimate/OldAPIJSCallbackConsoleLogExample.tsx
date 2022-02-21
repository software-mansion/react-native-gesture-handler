import {Text, View} from 'react-native';

import React from 'react';
import {PanGestureHandler} from 'react-native-gesture-handler';

declare const _WORKLET: boolean; // from react-native-reanimated

type Props = {
  color: string;
};

export function OldAPIJSCallbackConsoleLogExample({color}: Props) {
  const onGestureEvent = () => {
    console.log(global._WORKLET, 'onGestureEvent');
  };

  const onHandlerStateChange = () => {
    console.log(global._WORKLET, 'onHandlerStateChange');
  };

  return (
    <View>
      <Text>Old API / JS callback / console.log</Text>
      <View
        style={{height: 50, alignItems: 'center', justifyContent: 'center'}}
      >
        <PanGestureHandler
          maxPointers={1}
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
        >
          <View
            style={{
              width: 45,
              height: 45,
              backgroundColor: color,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />
        </PanGestureHandler>
      </View>
    </View>
  );
}
