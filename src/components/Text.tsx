import React, {
  ForwardedRef,
  forwardRef,
  RefObject,
  useEffect,
  useRef,
} from 'react';
import {
  Platform,
  Text as RNText,
  TextProps as RNTextProps,
} from 'react-native';

import { Gesture, GestureDetector } from '../';

export const Text = forwardRef(
  (props: RNTextProps, ref: ForwardedRef<RNText>) => {
    const { onPress, ...rest } = props;
    const textRef = useRef<RNText | null>(null);
    const native = Gesture.Native().runOnJS(true);

    const refHandler = (node: any) => {
      textRef.current = node;

      if (ref === null) {
        return;
      }

      if (typeof ref === 'function') {
        ref(node);
      } else {
        ref.current = node;
      }
    };

    useEffect(() => {
      if (Platform.OS !== 'web') {
        return;
      }

      const textElement = ref
        ? (ref as RefObject<RNText>).current
        : textRef.current;

      // At this point we are sure that textElement is div in HTML tree
      (textElement as unknown as HTMLDivElement)?.setAttribute(
        'rnghtext',
        'true'
      );
    }, []);

    return (
      <GestureDetector gesture={native}>
        <RNText onPress={onPress} ref={refHandler} {...rest} />
      </GestureDetector>
    );
  }
);
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type Text = typeof Text & RNText;
