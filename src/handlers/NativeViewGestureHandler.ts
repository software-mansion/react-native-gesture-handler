import createHandler from './createHandler';
import { BaseGestureHandlerProps, baseProps } from './gestureHandlers';

export interface NativeViewGestureHandlerProps
  extends BaseGestureHandlerProps<NativeViewGestureHandlerPayload> {
  shouldActivateOnStart?: boolean;
  disallowInterruption?: boolean;
}

export type NativeViewGestureHandlerPayload = {
  pointerInside: boolean;
};

export const nativeViewProps = [
  ...baseProps,
  'shouldActivateOnStart',
  'disallowInterruption',
] as const;

export type NativeViewGestureHandler = typeof NativeViewGestureHandler;
// eslint-disable-next-line @typescript-eslint/no-redeclare -- backward compatibility; see description on the top of gestureHandlers.ts file
export const NativeViewGestureHandler = createHandler<
  NativeViewGestureHandlerProps,
  NativeViewGestureHandlerPayload
>({
  name: 'NativeViewGestureHandler',
  allowedProps: nativeViewProps,
  config: {},
});
