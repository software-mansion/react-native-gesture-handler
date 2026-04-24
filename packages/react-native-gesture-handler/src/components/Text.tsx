import type { ComponentRef, Ref } from 'react';
import React, { useEffect, useMemo, useRef } from 'react';
import type { TextProps as RNTextProps } from 'react-native';
import { Platform, Text as RNText } from 'react-native';

import { GestureDetector } from '../handlers/gestures/GestureDetector';
import { GestureObjects as Gesture } from '../handlers/gestures/gestureObjects';

type TextProps = RNTextProps & {
  ref?: Ref<ComponentRef<typeof RNText> | null>;
};
type RNGHTextRef = Ref<RNText | null> & { rngh?: boolean };

/**
 * @deprecated `LegacyText` is deprecated. Since Gesture Handler 3, you should wrap `Text` with `GestureDetector`, `InterceptingGestureDetector`, or `VirtualGestureDetector`.
 */
export const LegacyText = (props: TextProps) => {
  const { onPress, onLongPress, ref, ...rest } = props;

  const textRef = useRef<RNText | null>(null);
  const native = useMemo(() => Gesture.Native().runOnJS(true), []);

  const refHandler = useMemo(() => {
    const handler: RNGHTextRef = (node: RNText | null) => {
      textRef.current = node;

      if (!ref) {
        return;
      }

      if (typeof ref === 'function') {
        ref(node);
      } else {
        ref.current = node;
      }
    };

    // This is a special case for `Text` component. After https://github.com/software-mansion/react-native-gesture-handler/pull/3379 we check for
    // `displayName` field. However, `Text` from RN has this field set to `Text`, but is also present in `RNSVGElements` set.
    // We don't want to treat our `Text` as the one from `SVG`, therefore we add special field to ref.
    handler.rngh = true;

    return handler;
  }, [ref]);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }

    // At this point we are sure that textElement is div in HTML tree
    (textRef.current as unknown as HTMLDivElement)?.setAttribute(
      'rnghtext',
      'true'
    );
  }, []);

  return onPress || onLongPress ? (
    <GestureDetector gesture={native}>
      <RNText
        onPress={onPress}
        onLongPress={onLongPress}
        ref={refHandler}
        {...rest}
      />
    </GestureDetector>
  ) : (
    <RNText ref={refHandler} {...rest} />
  );
};

/**
 * @deprecated `LegacyText` is deprecated. Since Gesture Handler 3, you should wrap `Text` with `GestureDetector`, `InterceptingGestureDetector`, or `VirtualGestureDetector`.
 */
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type LegacyText = typeof LegacyText & RNText;
