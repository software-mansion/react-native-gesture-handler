import React, { forwardRef, Ref, RefObject, useEffect, useRef } from 'react';
import {
  Platform,
  Text as RNText,
  TextProps as RNTextProps,
} from 'react-native';

import { Gesture, GestureDetector } from '../';

export const Text = forwardRef((props: RNTextProps, ref: Ref<RNText>) => {
  const { children, onPress, ...rest } = props;

  const textRef = useRef<RNText>(null);
  const native = Gesture.Native().runOnJS(true);

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
      <RNText onPress={onPress} ref={ref ?? textRef} {...rest}>
        {children}
      </RNText>
    </GestureDetector>
  );
});
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type Text = typeof Text & RNText;
