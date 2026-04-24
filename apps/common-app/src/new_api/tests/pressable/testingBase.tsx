import { commonStyles } from '../../../common';
import React from 'react';
import {
  Text,
  View,
  Pressable,
  PressableProps as RNPressableProps,
} from 'react-native';
import {
  Pressable as GesturizedPressable,
  PressableProps as GHPressableProps,
} from 'react-native-gesture-handler';

const TestingBase = (props: GHPressableProps & RNPressableProps) => (
  <>
    <GesturizedPressable {...props}>
      <View style={commonStyles.centerView}>
        <Text>RNGH pressable!</Text>
      </View>
    </GesturizedPressable>
    <Pressable {...props}>
      <View style={commonStyles.centerView}>
        <Text>RN pressable!</Text>
      </View>
    </Pressable>
  </>
);

export default TestingBase;
