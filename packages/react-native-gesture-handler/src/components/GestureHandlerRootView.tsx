import type { PropsWithChildren } from 'react';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import GestureHandlerRootViewContext from '../GestureHandlerRootViewContext';
import type { RootViewNativeProps } from '../specs/RNGestureHandlerRootViewNativeComponent';

export interface GestureHandlerRootViewProps
  extends PropsWithChildren<RootViewNativeProps> {}

export default function GestureHandlerRootView({
  style,
  ...rest
}: GestureHandlerRootViewProps) {
  return (
    <GestureHandlerRootViewContext value>
      <View style={style ?? styles.container} {...rest} />
    </GestureHandlerRootViewContext>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
