import React from 'react';
import type { PressableStateCallbackType } from 'react-native';
import { View } from 'react-native';

import { COLORS, commonStyles } from '../../../common';
import TestingBase from './testingBase';

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
