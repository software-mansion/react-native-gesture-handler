import * as React from 'react';
import { PropsWithChildren } from 'react';
import { View, requireNativeComponent } from 'react-native';

const GestureHandlerRootViewNative = requireNativeComponent(
  'GestureHandlerRootView'
);

const GestureHandlerRootViewContext = React.createContext(false);

type Props = PropsWithChildren<Record<string, unknown>>;

export default function GestureHandlerRootView({ children, ...rest }: Props) {
  return (
    <GestureHandlerRootViewContext.Consumer>
      {(available) => {
        if (available) {
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
