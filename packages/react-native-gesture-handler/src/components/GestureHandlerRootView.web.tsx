import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import GestureHandlerRootViewContext from '../GestureHandlerRootViewContext';
import type { PropsWithChildren } from 'react';
import type { ViewProps } from 'react-native';

export interface GestureHandlerRootViewProps
  extends PropsWithChildren<ViewProps> {}

export default function GestureHandlerRootView({
  style,
  ...rest
}: GestureHandlerRootViewProps) {
  return (
    <GestureHandlerRootViewContext.Provider value>
      <View style={style ?? styles.container} {...rest} />
    </GestureHandlerRootViewContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
