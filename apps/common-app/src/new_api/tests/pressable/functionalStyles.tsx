import { COLORS, commonStyles } from '../../../common';
import type { PressableStateCallbackType } from 'react-native';
import React from 'react';
import TestingBase from './testingBase';
import { View } from 'react-native';

export function FunctionalStyleExample() {
  const functionalStyle = (state: PressableStateCallbackType) => {
    if (state.pressed) {
      return [
        commonStyles.box,
        {
          backgroundColor: COLORS.KINDA_BLUE,
        },
      ];
    } else {
      return [
        commonStyles.box,
        {
          backgroundColor: COLORS.PURPLE,
        },
      ];
    }
  };

  return (
    <View style={commonStyles.row}>
      <TestingBase style={functionalStyle} />
    </View>
  );
}
