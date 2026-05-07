import type { ReactNode, RefObject } from 'react';
import { useEffect } from 'react';

import { NATIVE_GESTURE_ROLE_ATTRIBUTE } from '../../web/constants';
import { NativeGestureRole } from '../../web/interfaces';

export function useNativeGestureRole(
  viewRef: RefObject<Element | null>,
  children: ReactNode
): void {
  useEffect(() => {
    const child = viewRef.current?.firstChild as HTMLElement | undefined;

    if (!child) {
      return;
    }

    // @ts-ignore This exists on React.ReactNode
    const displayName = children?.type?.displayName as string;

    if (displayName === NativeGestureRole.ScrollView) {
      child.setAttribute(
        NATIVE_GESTURE_ROLE_ATTRIBUTE,
        NativeGestureRole.ScrollView
      );
    } else if (displayName === NativeGestureRole.Switch) {
      child.setAttribute(
        NATIVE_GESTURE_ROLE_ATTRIBUTE,
        NativeGestureRole.Switch
      );
    } else if (displayName === NativeGestureRole.Button) {
      child.setAttribute(
        NATIVE_GESTURE_ROLE_ATTRIBUTE,
        NativeGestureRole.Button
      );
    }

    return () => {
      child.removeAttribute(NATIVE_GESTURE_ROLE_ATTRIBUTE);
    };
  }, [children, viewRef]);
}
