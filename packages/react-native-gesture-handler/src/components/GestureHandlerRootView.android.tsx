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
    <GestureHandlerRootViewContext value>
      <GestureHandlerRootViewNativeComponent
        style={style ?? styles.container}
        {...rest}
        // @ts-expect-error _RNGH_MODULE_ID is injected via JSI
        moduleId={globalThis._RNGH_MODULE_ID} // Ensure moduleId is set
      />
    </GestureHandlerRootViewContext>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
