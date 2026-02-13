import React from 'react';
import { PressableStateCallbackType, View } from 'react-native';
import TestingBase from './testingBase';
import { COLORS, commonStyles } from '../../../common';

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
