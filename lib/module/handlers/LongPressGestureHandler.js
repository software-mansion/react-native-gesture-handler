import createHandler from './createHandler';
import { baseGestureHandlerProps } from './gestureHandlerCommon';
export const longPressGestureHandlerProps = ['minDurationMs', 'maxDist'];
// eslint-disable-next-line @typescript-eslint/no-redeclare -- backward compatibility; see description on the top of gestureHandlerCommon.ts file
export const LongPressGestureHandler = createHandler({
  name: 'LongPressGestureHandler',
  allowedProps: [...baseGestureHandlerProps, ...longPressGestureHandlerProps],
  config: {}
});
//# sourceMappingURL=LongPressGestureHandler.js.map