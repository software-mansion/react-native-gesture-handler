import * as React from 'react';
import { PropsWithChildren } from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import GestureHandlerRootViewContext from '../GestureHandlerRootViewContext';

export interface GestureHandlerRootViewProps
  extends PropsWithChildren<ViewProps> {}

export default function GestureHandlerRootView(
  props: GestureHandlerRootViewProps
) {
  const { style, ...rest } = props;

  return (
    <GestureHandlerRootViewContext.Provider value>
      <View style={style ?? styles.container} {...rest} />
    </GestureHandlerRootViewContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
