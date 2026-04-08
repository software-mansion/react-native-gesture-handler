import * as React from 'react';
import { PropsWithChildren } from 'react';
import { StyleSheet } from 'react-native';
import GestureHandlerRootViewContext from '../GestureHandlerRootViewContext';
import type { RootViewNativeProps } from '../specs/RNGestureHandlerRootViewNativeComponent';
import GestureHandlerRootViewNativeComponent from '../specs/RNGestureHandlerRootViewNativeComponent';

export interface GestureHandlerRootViewProps
  extends PropsWithChildren<RootViewNativeProps> {
  preventRecognizers?: boolean;
}

export default function GestureHandlerRootView({
  style,
  preventRecognizers,
  ...rest
}: GestureHandlerRootViewProps) {
  void preventRecognizers;

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
