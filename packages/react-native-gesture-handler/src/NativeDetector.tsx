import React from 'react';
import type { NativeProps } from './specs/RNGestureHandlerDetectorNativeComponent';
import RNGestureHandlerDetectorNativeComponent from './specs/RNGestureHandlerDetectorNativeComponent';

export interface NativeDetectorProps extends NativeProps {
  children?: React.ReactNode;
}

export function NativeDetector({ handlerTags, ...rest }: NativeDetectorProps) {
  return (
    <RNGestureHandlerDetectorNativeComponent
      handlerTags={handlerTags}
      {...rest}
    />
  );
}
