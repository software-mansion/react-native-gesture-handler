import * as React from 'react';
import { PropsWithChildren } from 'react';
import { requireNativeComponent } from 'react-native';

const GestureHandlerRootViewNative = requireNativeComponent(
  'GestureHandlerRootView'
);

type Props = PropsWithChildren<Record<string, unknown>>;

export default function GestureHandlerRootView({ children, ...rest }: Props) {
  return (
    <GestureHandlerRootViewNative {...rest}>
      {children}
    </GestureHandlerRootViewNative>
  );
}
