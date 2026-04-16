import React from 'react';
import { TouchableNativeFeedback, View } from 'react-native';

const RawButton = ({ enabled, children, ...rest }: any) => (
  <TouchableNativeFeedback disabled={enabled === false} {...rest}>
    {children ?? <View />}
  </TouchableNativeFeedback>
);

export const LegacyRawButton = RawButton;
export const LegacyBaseButton = RawButton;
export const LegacyRectButton = RawButton;
export const LegacyBorderlessButton = RawButton;
export const LegacyPureNativeButton = RawButton;
