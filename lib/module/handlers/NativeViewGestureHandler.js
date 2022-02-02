import createHandler from './createHandler';
import { baseGestureHandlerProps } from './gestureHandlerCommon';
export const nativeViewGestureHandlerProps = ['shouldActivateOnStart', 'disallowInterruption'];
export const nativeViewProps = [...baseGestureHandlerProps, ...nativeViewGestureHandlerProps];
// eslint-disable-next-line @typescript-eslint/no-redeclare -- backward compatibility; see description on the top of gestureHandlerCommon.ts file
export const NativeViewGestureHandler = createHandler({
  name: 'NativeViewGestureHandler',
  allowedProps: nativeViewProps,
  config: {}
});
//# sourceMappingURL=NativeViewGestureHandler.js.map