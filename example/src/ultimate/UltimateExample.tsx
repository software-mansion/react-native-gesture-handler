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
  // React.useEffect(() => {
  //   const interval = setInterval(() => {
  //     for (let i = 0; i < 300000000; i++) {
  //       /* nothing */
  //     }
  //   }, 100);
  //   return () => clearInterval(interval);
  // }, []);

  return (
    <View
      style={{
        flex: 1,
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
      <View>
        {/* prevents "Style property 'backgroundColor' is not supported by native animated module" error on fast refresh */}
        <OldAPIAnimatedEventExample useNativeDriver={false} color="gray" />
      </View>
    </View>
  );
}
