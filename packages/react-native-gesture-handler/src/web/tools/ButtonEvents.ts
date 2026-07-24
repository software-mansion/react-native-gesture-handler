import type { ButtonEvent } from '../../specs/RNGestureHandlerButtonNativeComponent';

export const ButtonEventName = {
  Press: 'gh:buttonPress',
  PressIn: 'gh:buttonPressIn',
  PressOut: 'gh:buttonPressOut',
  LongPress: 'gh:buttonLongPress',
  InteractionFinished: 'gh:buttonInteractionFinished',
} as const;

export type ButtonEventTypeName =
  (typeof ButtonEventName)[keyof typeof ButtonEventName];

export function dispatchButtonEvent(
  view: HTMLElement | null | undefined,
  name: ButtonEventTypeName,
  event: ButtonEvent
): void {
  view?.dispatchEvent(new CustomEvent(name, { detail: event }));
}
