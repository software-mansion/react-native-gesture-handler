import { PropsWithChildren } from 'react';
import { ViewProps } from 'react-native';
export interface GestureHandlerRootViewProps extends PropsWithChildren<ViewProps> {
}
export default function GestureHandlerRootView({ ...rest }: GestureHandlerRootViewProps): JSX.Element;
