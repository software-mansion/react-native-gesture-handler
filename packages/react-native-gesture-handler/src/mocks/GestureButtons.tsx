import React from 'react';
import { TouchableNativeFeedback, View } from 'react-native';
export const RawButton = ({ enabled, children, ...rest }: any) => (
  <TouchableNativeFeedback disabled={enabled === false} {...rest}>
    {children ?? <View />}
  </TouchableNativeFeedback>
);
export const BaseButton = RawButton;
export const RectButton = RawButton;
export const BorderlessButton = TouchableNativeFeedback;
