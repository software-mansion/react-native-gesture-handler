import React, { forwardRef, Ref, RefObject, useEffect, useRef } from 'react';
import {
  Platform,
  Text as RNText,
  TextProps as RNTextProps,
} from 'react-native';

import { NativeViewGestureHandler } from '../handlers/NativeViewGestureHandler';

import { State } from '../State';
import type { HandlerStateChangeEvent } from '../handlers/gestureHandlerCommon';
import type { NativeViewGestureHandlerPayload } from '../handlers/GestureHandlerEventPayload';

type TextProps = Omit<RNTextProps, 'onPress'> & {
  onPress?: (
    event: HandlerStateChangeEvent<NativeViewGestureHandlerPayload>
  ) => void;
};

export const Text = forwardRef((props: TextProps, ref: Ref<RNText>) => {
  const { children, onPress, ...rest } = props;

  const textRef = useRef<RNText>(null);

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
    <NativeViewGestureHandler
      onHandlerStateChange={(event) => {
        if (
          event.nativeEvent.oldState === State.ACTIVE &&
          event.nativeEvent.state === State.END
        ) {
          onPress?.(event);
        }
      }}>
      <RNText ref={ref ?? textRef} {...rest}>
        {children}
      </RNText>
    </NativeViewGestureHandler>
  );
});
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type Text = typeof Text & RNText;
