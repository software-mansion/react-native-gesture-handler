import React from 'react';
import type { NativeProps } from './specs/RNGestureHandlerDetectorNativeComponent';
import RNGestureHandlerDetectorNativeComponent from './specs/RNGestureHandlerDetectorNativeComponent';
import { StyleSheet } from 'react-native';

export interface NativeDetectorProps extends NativeProps {
  children?: React.ReactNode;
}

export function NativeDetector({ handlerTags, children }: NativeDetectorProps) {
  return (
    <RNGestureHandlerDetectorNativeComponent
      handlerTags={handlerTags}
      style={styles.detector}>
      {children}
    </RNGestureHandlerDetectorNativeComponent>
  );
}

const styles = StyleSheet.create({
  detector: {
    display: 'contents',
    // TODO: remove, debug info only
    backgroundColor: 'red',
  },
});
