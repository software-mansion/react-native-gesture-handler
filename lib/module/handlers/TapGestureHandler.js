import createHandler from './createHandler';
import { baseGestureHandlerProps } from './gestureHandlerCommon';
export const tapGestureHandlerProps = ['maxDurationMs', 'maxDelayMs', 'numberOfTaps', 'maxDeltaX', 'maxDeltaY', 'maxDist', 'minPointers'];
// eslint-disable-next-line @typescript-eslint/no-redeclare -- backward compatibility; see description on the top of gestureHandlerCommon.ts file
export const TapGestureHandler = createHandler({
  name: 'TapGestureHandler',
  allowedProps: [...baseGestureHandlerProps, ...tapGestureHandlerProps],
  config: {}
});
//# sourceMappingURL=TapGestureHandler.js.map