import type { ReactNode, RefObject } from 'react';

export function useNativeGestureRole(
  _viewRef: RefObject<Element | null>,
  _children: ReactNode
): void {
  // No-op on native; the web implementation lives in `useNativeGestureRole.web.ts`.
}
