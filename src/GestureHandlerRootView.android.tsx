/* eslint-disable @typescript-eslint/no-var-requires */
import * as React from 'react';
import { PropsWithChildren } from 'react';
import { requireNativeComponent, ViewProps } from 'react-native';
import { isFabric } from './utils';

const GestureHandlerRootViewNativeComponent = isFabric()
  ? require('./fabric/RNGestureHandlerRootViewNativeComponent').default
  : requireNativeComponent('RNGestureHandlerRootView');

export interface GestureHandlerRootViewProps
  extends PropsWithChildren<ViewProps> {}

export default function GestureHandlerRootView(
  props: GestureHandlerRootViewProps
) {
  return <GestureHandlerRootViewNativeComponent {...props} />;
}
