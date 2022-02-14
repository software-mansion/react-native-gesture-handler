import * as React from 'react';
import { PropsWithChildren } from 'react';
import { ViewProps } from 'react-native';
import GestureHandlerRootViewNativeComponent from './fabric/RNGestureHandlerRootViewNativeComponent';

export interface GestureHandlerRootViewProps
  extends PropsWithChildren<ViewProps> {}

export default function GestureHandlerRootView({
  children,
  ...rest
}: GestureHandlerRootViewProps) {
  return (
    <GestureHandlerRootViewNativeComponent {...rest}>
      {children}
    </GestureHandlerRootViewNativeComponent>
  );
}
