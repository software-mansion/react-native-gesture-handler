import type { PropsWithChildren, Ref } from 'react';
import React, { useCallback } from 'react';

import { tagMessage } from '../../../utils';

export type WrapRef = Ref<unknown> | undefined;

export type WrapProps = PropsWithChildren<{ ref?: WrapRef }>;

function isHostInstance(instance: unknown) {
  return (
    (instance as { __internalInstanceHandle?: unknown } | null | undefined)
      ?.__internalInstanceHandle !== undefined
  );
}

function preferHostInstance(instance: unknown) {
  if (instance === null || instance === undefined || isHostInstance(instance)) {
    return instance;
  }

  const nativeRef = (
    instance as { getNativeScrollRef?: () => unknown }
  ).getNativeScrollRef?.();

  return isHostInstance(nativeRef) ? nativeRef : instance;
}

function assignRef(ref: WrapRef, instance: unknown) {
  if (typeof ref === 'function') {
    return ref(instance as never);
  }
  if (ref) {
    ref.current = instance;
  }
  return undefined;
}

export const Wrap: React.FunctionComponent<WrapProps> = ({ ref, children }) => {
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

  return React.cloneElement(
    child,
    { collapsable: false, ref: attachRef },
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    child.props.children
  );
};
