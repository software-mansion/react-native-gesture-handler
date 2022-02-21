import {Text, View} from 'react-native';

import {NewAPIJSCallbackConsoleLogExample} from './NewAPIJSCallbackConsoleLogExample';
import {OldAPIAnimatedEventExample} from './OldAPIAnimatedEventExample';
import {OldAPIJSCallbackConsoleLogExample} from './OldAPIJSCallbackConsoleLogExample';
import React from 'react';

export default function UltimateExample() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{marginVertical: 7}}>
        The purpose of this example is to demonstrate all possible interactions
        between Gesture Handler and JS callbacks, Animated.event, Reanimated
        worklets etc.
      </Text>
      <NewAPIJSCallbackConsoleLogExample color="red" />
      {/* <NewAPIReanimatedWorkletConsoleLogExample color="darkorange" /> */}
      {/* <NewAPIJSCallbackUpdateSharedValueExample color="gold" /> */}
      {/* <NewAPIReanimatedWorkletUpdateSharedValueExample color="lime" /> */}
      <OldAPIJSCallbackConsoleLogExample color="cyan" />
      {/* <OldAPIReanimatedWorkletConsoleLogExample color="deepskyblue" /> */}
      {/* <OldAPIJSCallbackUpdateSharedValueExample color="darkviolet" /> */}
      {/* <OldAPIReanimatedWorkletUpdateSharedValueExample color="violet" /> */}
      <OldAPIAnimatedEventExample useNativeDriver color="lightgray" />
      <View>
        {/* prevents "Style property 'backgroundColor' is not supported by native animated module" error on fast refresh */}
        {/* this is probably a bug in React Native core */}
        <OldAPIAnimatedEventExample useNativeDriver={false} color="gray" />
      </View>
    </View>
  );
}
