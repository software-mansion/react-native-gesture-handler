import createHandler from './createHandler';
import {
  BaseGestureHandlerProperties,
  baseProperties,
} from './gestureHandlers';

export interface NativeViewGestureHandlerProperties
  extends BaseGestureHandlerProperties<NativeViewGestureHandlerPayload> {
  shouldActivateOnStart?: boolean;
  disallowInterruption?: boolean;
}

export type NativeViewGestureHandlerPayload = {
  pointerInside: boolean;
};

export const nativeViewProperties = [
  ...baseProperties,
  'shouldActivateOnStart',
  'disallowInterruption',
] as const;

export type NativeViewGestureHandler = typeof NativeViewGestureHandler;
// For the reason why, see the comment at the top of gestureHandlers.ts
// eslint-disable-next-line no-redeclare
export const NativeViewGestureHandler = createHandler<
  NativeViewGestureHandlerProperties,
  NativeViewGestureHandlerPayload
>({
  name: 'NativeViewGestureHandler',
  allowedProps: nativeViewProperties,
  config: {},
});
