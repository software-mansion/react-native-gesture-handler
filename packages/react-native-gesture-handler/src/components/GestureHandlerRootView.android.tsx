import * as React from 'react';
import { PropsWithChildren } from 'react';
import { ViewProps, StyleSheet } from 'react-native';
import GestureHandlerRootViewContext from '../GestureHandlerRootViewContext';
import GestureHandlerRootViewNativeComponent from '../specs/RNGestureHandlerRootViewNativeComponent';

export interface GestureHandlerRootViewProps
  extends PropsWithChildren<ViewProps> {}

export default function GestureHandlerRootView({
  style,
  ...rest
}: GestureHandlerRootViewProps) {
  return (
    <GestureHandlerRootViewContext.Provider value>
      <GestureHandlerRootViewNativeComponent
        style={style ?? styles.container}
        {...rest}
      />
    </GestureHandlerRootViewContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
