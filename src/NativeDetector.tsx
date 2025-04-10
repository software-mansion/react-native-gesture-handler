import React from 'react';
import RNGestureHandlerDetectorNativeComponent from './specs/RNGestureHandlerDetectorNativeComponent';
import { StyleSheet } from 'react-native';
import { _NativeGesture } from './handlers/gesturesV3/types';

export interface NativeDetectorProps<TConfig> {
  gesture: _NativeGesture<TConfig>;
  children?: React.ReactNode;
}

export function NativeDetector<TConfig>({
  gesture,
  children,
}: NativeDetectorProps<TConfig>) {
  return (
    <RNGestureHandlerDetectorNativeComponent
      onGestureHandlerStateChange={(event) => {
        console.log('onGestureHandlerStateChange', event.nativeEvent);
      }}
      handlerTags={[gesture.tag]}
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
