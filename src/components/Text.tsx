import React, { forwardRef, Ref, RefObject, useEffect, useRef } from 'react';
import {
  Platform,
  Text as RNText,
  TextProps as RNTextProps,
} from 'react-native';

import type { GestureStateChangeEvent } from '../handlers/gestureHandlerCommon';
import type { NativeViewGestureHandlerPayload } from '../handlers/GestureHandlerEventPayload';
import { Gesture, GestureDetector } from '../';

type TextProps = Omit<RNTextProps, 'onPress'> & {
  onPress?: (
    event: GestureStateChangeEvent<NativeViewGestureHandlerPayload>
  ) => void;
};

export const Text = forwardRef((props: TextProps, ref: Ref<RNText>) => {
  const { children, onPress, ...rest } = props;

  const textRef = useRef<RNText>(null);
  const native = Gesture.Native()
    .onEnd((event, _) => onPress?.(event))
    .runOnJS(true);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }

    const textElement = ref
      ? (ref as RefObject<RNText>).current
      : textRef.current;

    // @ts-ignore at this point we are sure that text is div
    textElement?.setAttribute('RNGHText', 'true');
  }, []);

  return (
    <GestureDetector gesture={native}>
      <RNText ref={ref ?? textRef} {...rest}>
        {children}
      </RNText>
    </GestureDetector>
  );
});
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type Text = typeof Text & RNText;
