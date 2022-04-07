import * as React from 'react';
import { PropsWithChildren } from 'react';
import { View, ViewProps } from 'react-native';

export interface GestureHandlerRootViewProps
  extends PropsWithChildren<ViewProps> {}

export default function GestureHandlerRootView(
  props: GestureHandlerRootViewProps
) {
  return <View {...props} />;
}
