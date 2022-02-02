import createHandler from './createHandler';
import { baseGestureHandlerProps } from './gestureHandlerCommon';
// eslint-disable-next-line @typescript-eslint/no-redeclare -- backward compatibility; see description on the top of gestureHandlerCommon.ts file
export const RotationGestureHandler = createHandler({
  name: 'RotationGestureHandler',
  allowedProps: baseGestureHandlerProps,
  config: {}
});
//# sourceMappingURL=RotationGestureHandler.js.map