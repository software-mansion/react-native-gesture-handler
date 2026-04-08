import * as React from 'react';
import { PropsWithChildren } from 'react';
import { View, StyleSheet } from 'react-native';
import GestureHandlerRootViewContext from '../GestureHandlerRootViewContext';
import RNGestureHandlerModule from '../RNGestureHandlerModule';
import type { RootViewNativeProps } from '../specs/RNGestureHandlerRootViewNativeComponent';

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
    console.log('Setting preventRecognizers to', preventRecognizers);
    console.log(RNGestureHandlerModule.setShouldPreventRecognizers);

    (
      RNGestureHandlerModule as RootViewConfigModule
    ).setShouldPreventRecognizers?.(preventRecognizers);
  }, [preventRecognizers]);

  return (
    <GestureHandlerRootViewContext.Provider value>
      <View style={style ?? styles.container} {...rest} />
    </GestureHandlerRootViewContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
