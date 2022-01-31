import { View, Text } from 'react-native';

import React from 'react';
import { NewAPIJSCallbackConsoleLogExample } from './NewAPIJSCallbackConsoleLogExample';
import { NewAPIReanimatedWorkletConsoleLogExample } from './NewAPIReanimatedWorkletConsoleLogExample';
import { NewAPIJSCallbackUpdateSharedValueExample } from './NewAPIJSCallbackUpdateSharedValueExample';
import { NewAPIReanimatedWorkletUpdateSharedValueExample } from './NewAPIReanimatedWorkletUpdateSharedValueExample';
import { OldAPIJSCallbackConsoleLogExample } from './OldAPIJSCallbackConsoleLogExample';
import { OldAPIReanimatedWorkletConsoleLogExample } from './OldAPIReanimatedWorkletConsoleLogExample';
import { OldAPIJSCallbackUpdateSharedValueExample } from './OldAPIJSCallbackUpdateSharedValueExample';
import { OldAPIReanimatedWorkletUpdateSharedValueExample } from './OldAPIReanimatedWorkletUpdateSharedValueExample';
import { OldAPIAnimatedEventExample } from './OldAPIAnimatedEventExample';

export default function UltimateExample() {
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Text style={{ marginVertical: 7 }}>
        The purpose of this example is to demonstrate all possible interactions
        between Gesture Handler and JS callbacks, Animated.event, Reanimated
        worklets etc.
      </Text>
      <NewAPIJSCallbackConsoleLogExample color="red" />
      <NewAPIReanimatedWorkletConsoleLogExample color="darkorange" />
      <NewAPIJSCallbackUpdateSharedValueExample color="gold" />
      <NewAPIReanimatedWorkletUpdateSharedValueExample color="lime" />
      <OldAPIJSCallbackConsoleLogExample color="cyan" />
      <OldAPIReanimatedWorkletConsoleLogExample color="deepskyblue" />
      <OldAPIJSCallbackUpdateSharedValueExample color="darkviolet" />
      <OldAPIReanimatedWorkletUpdateSharedValueExample color="violet" />
      <OldAPIAnimatedEventExample useNativeDriver color="lightgray" />
      <OldAPIAnimatedEventExample useNativeDriver={false} color="gray" />
    </View>
  );
}
