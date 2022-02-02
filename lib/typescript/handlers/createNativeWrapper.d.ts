import * as React from 'react';
import { NativeViewGestureHandlerProps } from './NativeViewGestureHandler';
export default function createNativeWrapper<P>(Component: React.ComponentType<P>, config?: Readonly<NativeViewGestureHandlerProps>): React.ForwardRefExoticComponent<React.PropsWithoutRef<P & NativeViewGestureHandlerProps> & React.RefAttributes<React.ComponentType<any>>>;
