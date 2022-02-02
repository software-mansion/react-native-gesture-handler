import createHandler from './createHandler';
import { baseGestureHandlerProps } from './gestureHandlerCommon';
export const flingGestureHandlerProps = ['numberOfPointers', 'direction'];
// eslint-disable-next-line @typescript-eslint/no-redeclare -- backward compatibility; see description on the top of gestureHandlerCommon.ts file
export const FlingGestureHandler = createHandler({
  name: 'FlingGestureHandler',
  allowedProps: [...baseGestureHandlerProps, ...flingGestureHandlerProps],
  config: {}
});
//# sourceMappingURL=FlingGestureHandler.js.map