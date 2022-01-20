import { LogBox, View, Text } from 'react-native';

import React from 'react';
import { NewAPIJSCallbackConsoleLogExample } from './NewAPIJSCallbackConsoleLogExample';
import { NewAPIReanimatedWorkletConsoleLogExample } from './NewAPIReanimatedWorkletConsoleLogExample';
import { NewAPIJSCallbackUpdateSharedValueExample } from './NewAPIJSCallbackUpdateSharedValueExample';
import { NewAPIReanimatedWorkletUpdateSharedValueExample } from './NewAPIReanimatedWorkletUpdateSharedValueExample';
import { OldAPIJSCallbackConsoleLogExample } from './OldAPIJSCallbackConsoleLogExample';
import { OldAPIReanimatedWorkletConsoleLogExample } from './OldAPIReanimatedWorkletConsoleLogExample';
import { OldAPIAnimatedEventExampleUseNativeDriverTrue } from './OldAPIAnimatedEventExampleUseNativeDriverTrue';
import { OldAPIAnimatedEventExampleUseNativeDriverFalse } from './OldAPIAnimatedEventExampleUseNativeDriverFalse';

export default function UltimateExample() {
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Text style={{ marginVertical: 10 }}>
        The purpose of this example is to demonstrate all possible interactions
        between Gesture Handler and JS callbacks, Animated.event, Reanimated
        worklets etc.
      </Text>
      <NewAPIJSCallbackConsoleLogExample />
      <NewAPIReanimatedWorkletConsoleLogExample />
      <NewAPIJSCallbackUpdateSharedValueExample />
      <NewAPIReanimatedWorkletUpdateSharedValueExample />
      <OldAPIJSCallbackConsoleLogExample />
      <OldAPIReanimatedWorkletConsoleLogExample />
      <OldAPIAnimatedEventExampleUseNativeDriverTrue />
      <OldAPIAnimatedEventExampleUseNativeDriverFalse />
    </View>
  );
}

LogBox.ignoreLogs([
  "[react-native-gesture-handler] Seems like you're using an old API with gesture components, check out new Gestures system!",
]);
