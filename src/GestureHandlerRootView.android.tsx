/* eslint-disable @typescript-eslint/no-var-requires */
import * as React from 'react';
import { PropsWithChildren } from 'react';
import { requireNativeComponent, ViewProps } from 'react-native';
import { isFabric } from './utils';
import { maybeInitializeFabric } from './init';

const GestureHandlerRootViewNativeComponent = isFabric()
  ? require('./fabric/RNGestureHandlerRootViewNativeComponent').default
  : requireNativeComponent('RNGestureHandlerRootView');

export interface GestureHandlerRootViewProps
  extends PropsWithChildren<ViewProps> {}

export default function GestureHandlerRootView(
  props: GestureHandlerRootViewProps
) {
  // try initialize fabric on the first render, at this point we can
  // reliably check if fabric is enabled (the function contains a flag
  // to make sure it's called only once)
  maybeInitializeFabric();

  return <GestureHandlerRootViewNativeComponent {...props} />;
}
