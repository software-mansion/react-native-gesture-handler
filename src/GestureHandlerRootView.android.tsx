import * as React from 'react';
import { View, requireNativeComponent } from 'react-native';
import { GestureHandlerRootViewProps } from './GestureHandlerRootView';

const GestureHandlerRootViewNative = requireNativeComponent(
  'GestureHandlerRootView'
);

const GestureHandlerRootViewContext = React.createContext(false);

export default function GestureHandlerRootView({
  children,
  forcedRender,
  ...rest
}: GestureHandlerRootViewProps) {
  return (
    <GestureHandlerRootViewContext.Consumer>
      {(available) => {
        if (available && !forcedRender) {
          // If we already have a parent wrapped in the gesture handler root view,
          // We don't need to wrap it again in root view
          // We still wrap it in a normal view so our styling stays the same
          return <View {...rest}>{children}</View>;
        }

        return (
          <GestureHandlerRootViewContext.Provider value>
            <GestureHandlerRootViewNative {...rest}>
              {children}
            </GestureHandlerRootViewNative>
          </GestureHandlerRootViewContext.Provider>
        );
      }}
    </GestureHandlerRootViewContext.Consumer>
  );
}
