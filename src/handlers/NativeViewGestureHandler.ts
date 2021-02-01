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
// eslint-disable-next-line @typescript-eslint/no-redeclare -- backward compatibility; see description on the top of gestureHandlers.ts file
export const NativeViewGestureHandler = createHandler<
  NativeViewGestureHandlerProperties,
  NativeViewGestureHandlerPayload
>({
  name: 'NativeViewGestureHandler',
  allowedProps: nativeViewProperties,
  config: {},
});
