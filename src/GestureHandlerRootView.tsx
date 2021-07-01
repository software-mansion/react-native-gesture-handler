import * as React from 'react';
import { PropsWithChildren } from 'react';
import { View, ViewProps } from 'react-native';

export interface GestureHandlerRootViewProps
  extends PropsWithChildren<ViewProps> {
  forcedRender?: boolean;
}

export default function GestureHandlerRootView({
  forcedRender,
  ...rest
}: GestureHandlerRootViewProps) {
  return <View {...rest} />;
}
