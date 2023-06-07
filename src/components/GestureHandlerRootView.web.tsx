import * as React from 'react';
import { PropsWithChildren } from 'react';
import { View, ViewProps } from 'react-native';
import GestureHandlerRootViewContext from '../GestureHandlerRootViewContext';

export interface GestureHandlerRootViewProps
  extends PropsWithChildren<ViewProps> {}

export default function GestureHandlerRootView(
  props: GestureHandlerRootViewProps
) {
  return (
    <GestureHandlerRootViewContext.Provider value>
      <View {...props} />
    </GestureHandlerRootViewContext.Provider>
  );
}
