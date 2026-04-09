import * as React from 'react';
import { PropsWithChildren } from 'react';
import { StyleSheet } from 'react-native';
import GestureHandlerRootViewContext from '../GestureHandlerRootViewContext';
import RNGestureHandlerModule from '../RNGestureHandlerModule';
import type { RootViewNativeProps } from '../specs/RNGestureHandlerRootViewNativeComponent';
import GestureHandlerRootViewNativeComponent from '../specs/RNGestureHandlerRootViewNativeComponent';

type RootViewConfigModule = {
  setShouldPreventRecognizers?: (shouldPreventRecognizers: boolean) => void;
};

export interface GestureHandlerRootViewProps
  extends PropsWithChildren<RootViewNativeProps> {
  preventRecognizers?: boolean;
}

export default function GestureHandlerRootView({
  style,
  preventRecognizers = true,
  ...rest
}: GestureHandlerRootViewProps) {
  React.useEffect(() => {
    (
      RNGestureHandlerModule as RootViewConfigModule
    ).setShouldPreventRecognizers?.(preventRecognizers);
  }, [preventRecognizers]);

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
