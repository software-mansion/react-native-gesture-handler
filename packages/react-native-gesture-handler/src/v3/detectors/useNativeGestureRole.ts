import type { ReactNode, RefObject } from 'react';

export function useNativeGestureRole(
  _viewRef: RefObject<unknown>,
  _children: ReactNode
): void {
  // No-op on native; the web implementation lives in `useNativeGestureRole.web.ts`.
}
