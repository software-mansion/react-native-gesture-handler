function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import React from 'react';
import PlatformConstants from '../PlatformConstants';
import createHandler from './createHandler';
import { baseGestureHandlerProps } from './gestureHandlerCommon';
export const forceTouchGestureHandlerProps = ['minForce', 'maxForce', 'feedbackOnActivation'];

class ForceTouchFallback extends React.Component {
  componentDidMount() {
    console.warn('ForceTouchGestureHandler is not available on this platform. Please use ForceTouchGestureHandler.forceTouchAvailable to conditionally render other components that would provide a fallback behavior specific to your usecase');
  }

  render() {
    return this.props.children;
  }

}

_defineProperty(ForceTouchFallback, "forceTouchAvailable", false);

// eslint-disable-next-line @typescript-eslint/no-redeclare -- backward compatibility; see description on the top of gestureHandlerCommon.ts file
export const ForceTouchGestureHandler = PlatformConstants !== null && PlatformConstants !== void 0 && PlatformConstants.forceTouchAvailable ? createHandler({
  name: 'ForceTouchGestureHandler',
  allowedProps: [...baseGestureHandlerProps, ...forceTouchGestureHandlerProps],
  config: {}
}) : ForceTouchFallback;
ForceTouchGestureHandler.forceTouchAvailable = (PlatformConstants === null || PlatformConstants === void 0 ? void 0 : PlatformConstants.forceTouchAvailable) || false;
//# sourceMappingURL=ForceTouchGestureHandler.js.map