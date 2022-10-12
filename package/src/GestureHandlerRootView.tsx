import * as React from 'react';
import { PropsWithChildren } from 'react';
import { View, ViewProps } from 'react-native';
import { maybeInitializeFabric } from './init';

export interface GestureHandlerRootViewProps
  extends PropsWithChildren<ViewProps> {}

export default function GestureHandlerRootView(
  props: GestureHandlerRootViewProps
) {
  // try initialize fabric on the first render, at this point we can
  // reliably check if fabric is enabled (the function contains a flag
  // to make sure it's called only once)
  maybeInitializeFabric();

  return <View {...props} />;
}
