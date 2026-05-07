export const GestureLifecycleEvent = {
  Began: 'gh:gestureBegan',
  Canceled: 'gh:gestureCanceled',
} as const;

export type GestureLifecycleEventName =
  (typeof GestureLifecycleEvent)[keyof typeof GestureLifecycleEvent];

export function dispatchGestureLifecycleEvent(
  view: HTMLElement | null | undefined,
  name: GestureLifecycleEventName
): void {
  view?.dispatchEvent(new CustomEvent(name));
}
