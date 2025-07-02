import React from 'react';
import RNGestureHandlerDetectorNativeComponent from './specs/RNGestureHandlerDetectorNativeComponent';
import { StyleSheet } from 'react-native';
import { NativeGesture } from './useGesture';

export interface NativeDetectorProps {
  children?: React.ReactNode;
  gesture: NativeGesture;
}

export function NativeDetector({ gesture, children }: NativeDetectorProps) {
  return (
    <RNGestureHandlerDetectorNativeComponent
      onGestureHandlerStateChange={(event) => {
        console.log('onGestureHandlerStateChange', event.nativeEvent);
      }}
      // @ts-expect-error _RNGH_MODULE_ID is injected via JSI
      moduleId={globalThis._RNGH_MODULE_ID}
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
