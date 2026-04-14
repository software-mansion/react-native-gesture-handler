import { Pressable, Text, View } from 'react-native';
import type { PressableProps as GHPressableProps } from 'react-native-gesture-handler';
import { Pressable as GesturizedPressable } from 'react-native-gesture-handler';
import type { PressableProps as RNPressableProps } from 'react-native';
import React from 'react';
import { commonStyles } from '../../../common';

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
