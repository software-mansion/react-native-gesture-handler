import React from 'react';
import {
  ScrollView,
  FlatList,
  Switch,
  TextInput,
  RefreshControl,
  TouchableNativeFeedback,
  View,
} from 'react-native';

export { ScrollView, FlatList, Switch, TextInput, RefreshControl };

const RawButton = ({ enabled, children, ...rest }: any) => (
  <TouchableNativeFeedback disabled={enabled === false} {...rest}>
    {children ?? <View />}
  </TouchableNativeFeedback>
);

export { RawButton };
export const BaseButton = RawButton;
export const RectButton = RawButton;
export const BorderlessButton = RawButton;
export const Clickable = RawButton;
