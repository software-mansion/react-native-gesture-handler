import * as React from 'react';
import GestureHandlerRootViewContext from '../GestureHandlerRootViewContext';
import GestureHandlerRootViewNativeComponent from '../specs/RNGestureHandlerRootViewNativeComponent';
import type { PropsWithChildren } from 'react';
import type { RootViewNativeProps } from '../specs/RNGestureHandlerRootViewNativeComponent';
import { StyleSheet } from 'react-native';

export interface GestureHandlerRootViewProps
  extends PropsWithChildren<RootViewNativeProps> {}

export default function GestureHandlerRootView({
  style,
  ...rest
}: GestureHandlerRootViewProps) {
  return (
    <GestureHandlerRootViewContext value>
      <GestureHandlerRootViewNativeComponent
        style={style ?? styles.container}
        {...rest}
        moduleId={globalThis._RNGH_MODULE_ID} // Ensure moduleId is set
      />
    </GestureHandlerRootViewContext>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
