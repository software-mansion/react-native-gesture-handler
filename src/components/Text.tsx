import * as React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';

import { NativeViewGestureHandler } from '../handlers/NativeViewGestureHandler';

import { State } from '../State';
import type { HandlerStateChangeEvent } from '../handlers/gestureHandlerCommon';
import type { NativeViewGestureHandlerPayload } from '../handlers/GestureHandlerEventPayload';

type TextProps = Omit<RNTextProps, 'onPress'> & {
  onPress?: (
    event: HandlerStateChangeEvent<NativeViewGestureHandlerPayload>
  ) => void;
};

export const Text = (props: TextProps) => {
  console.log(props);
  const { children, onPress, ...rest } = props;
  return (
    <NativeViewGestureHandler
      onHandlerStateChange={(event) => {
        console.log(event);
        if (
          event.nativeEvent.oldState === State.ACTIVE &&
          event.nativeEvent.state === State.END
        ) {
          onPress?.(event);
        }
      }}>
      <RNText {...rest}>{children}</RNText>
    </NativeViewGestureHandler>
  );
};
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type Text = typeof Text & RNText;
