import createHandler from './createHandler';
import { baseGestureHandlerProps } from './gestureHandlerCommon';
// eslint-disable-next-line @typescript-eslint/no-redeclare -- backward compatibility; see description on the top of gestureHandlerCommon.ts file
export const PinchGestureHandler = createHandler({
  name: 'PinchGestureHandler',
  allowedProps: baseGestureHandlerProps,
  config: {}
});
//# sourceMappingURL=PinchGestureHandler.js.map