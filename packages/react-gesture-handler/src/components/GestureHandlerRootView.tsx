import * as React from 'react';
import { PropsWithChildren } from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { maybeInitializeFabric } from '../init';
import GestureHandlerRootViewContext from '../GestureHandlerRootViewContext';

export interface GestureHandlerRootViewProps
  extends PropsWithChildren<ViewProps> {}

export default function GestureHandlerRootView({
  style,
  ...rest
}: GestureHandlerRootViewProps) {
  // Try initialize fabric on the first render, at this point we can
  // reliably check if fabric is enabled (the function contains a flag
  // to make sure it's called only once)
  maybeInitializeFabric();

  return (
    <GestureHandlerRootViewContext.Provider value>
      <View style={style ?? styles.container} {...rest} />
    </GestureHandlerRootViewContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
