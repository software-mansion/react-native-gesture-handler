import React, { Ref, RefObject, useEffect, useMemo, useRef } from 'react';
import {
  Platform,
  Text as RNText,
  TextProps as RNTextProps,
} from 'react-native';

import { GestureObjects as Gesture } from '../handlers/gestures/gestureObjects';
import { GestureDetector } from '../handlers/gestures/GestureDetector';

type TextProps = RNTextProps & { ref?: Ref<RNText | null> };

export const LegacyText = (props: TextProps) => {
  const { onPress, onLongPress, ...rest } = props;

  const textRef = useRef<RNText | null>(null);
  const native = useMemo(() => Gesture.Native().runOnJS(true), []);

  const refHandler = (node: RNText | null) => {
    textRef.current = node;

    if (!props.ref) {
      return;
    }

    if (typeof props.ref === 'function') {
      props.ref(node);
    } else {
      props.ref.current = node;
    }
  };

  // This is a special case for `Text` component. After https://github.com/software-mansion/react-native-gesture-handler/pull/3379 we check for
  // `displayName` field. However, `Text` from RN has this field set to `Text`, but is also present in `RNSVGElements` set.
  // We don't want to treat our `Text` as the one from `SVG`, therefore we add special field to ref.
  refHandler.rngh = true;

  useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }

    const textElement = props.ref
      ? (props.ref as RefObject<React.ComponentRef<typeof RNText>>).current
      : textRef.current;

    // At this point we are sure that textElement is div in HTML tree
    (textElement as unknown as HTMLDivElement)?.setAttribute(
      'rnghtext',
      'true'
    );
  }, [props.ref]);

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
    <RNText ref={props.ref} {...rest} />
  );
};

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type LegacyText = typeof LegacyText & RNText;
