import type { PropsWithChildren } from 'react';
import React, { useCallback } from 'react';
import type { GestureResponderEvent } from 'react-native';

import type { WrapRef } from '../../../hostInstance';
import { assignRef, preferHostInstance } from '../../../hostInstance';
import { tagMessage } from '../../../utils';

export type { WrapRef };

export type WrapProps = PropsWithChildren<{
  ref?: WrapRef;
  onStartShouldSetResponder?: (event: GestureResponderEvent) => boolean;
}>;

export const Wrap: React.FunctionComponent<WrapProps> = ({
  ref,
  children,
  onStartShouldSetResponder,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let child: any;
  try {
    child = React.Children.only(children);
  } catch (e) {
    throw new Error(
      tagMessage(
        `VirtualGestureDetector expects exactly one React element as its child. To use a gesture with multiple views, wrap them in a single parent view and attach the gesture to that.`
      )
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const childRef = child.props.ref as WrapRef;

  const attachRef = useCallback(
    (instance: unknown) => {
      const childCleanup = assignRef(childRef, instance);
      const forwardedCleanup = assignRef(ref, preferHostInstance(instance));
      const hasCleanup =
        typeof childCleanup === 'function' ||
        typeof forwardedCleanup === 'function';

      if (!hasCleanup) {
        return undefined;
      }

      return () => {
        if (typeof childCleanup === 'function') {
          childCleanup();
        } else {
          assignRef(childRef, null);
        }
        if (typeof forwardedCleanup === 'function') {
          forwardedCleanup();
        } else {
          assignRef(ref, null);
        }
      };
    },
    [childRef, ref]
  );

  const childOnStartShouldSetResponder =
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    child.props.onStartShouldSetResponder as
      | ((event: GestureResponderEvent) => boolean)
      | undefined;

  // Marks the responder event for the scroll view interop, then defers to the
  // child's own handler.
  const handleStartShouldSetResponder = useCallback(
    (event: GestureResponderEvent) => {
      onStartShouldSetResponder?.(event);
      return childOnStartShouldSetResponder?.(event) ?? false;
    },
    [onStartShouldSetResponder, childOnStartShouldSetResponder]
  );

  return React.cloneElement(
    child,
    {
      collapsable: false,
      ref: attachRef,
      onStartShouldSetResponder: handleStartShouldSetResponder,
    },
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    child.props.children
  );
};
