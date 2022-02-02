"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.managePanProps = managePanProps;
exports.PanGestureHandler = exports.panGestureHandlerCustomNativeProps = exports.panGestureHandlerProps = void 0;

var _createHandler = _interopRequireDefault(require("./createHandler"));

var _gestureHandlerCommon = require("./gestureHandlerCommon");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const panGestureHandlerProps = ['activeOffsetY', 'activeOffsetX', 'failOffsetY', 'failOffsetX', 'minDist', 'minVelocity', 'minVelocityX', 'minVelocityY', 'minPointers', 'maxPointers', 'avgTouches', 'enableTrackpadTwoFingerGesture'];
exports.panGestureHandlerProps = panGestureHandlerProps;
const panGestureHandlerCustomNativeProps = ['activeOffsetYStart', 'activeOffsetYEnd', 'activeOffsetXStart', 'activeOffsetXEnd', 'failOffsetYStart', 'failOffsetYEnd', 'failOffsetXStart', 'failOffsetXEnd'];
exports.panGestureHandlerCustomNativeProps = panGestureHandlerCustomNativeProps;
// eslint-disable-next-line @typescript-eslint/no-redeclare -- backward compatibility; see description on the top of gestureHandlerCommon.ts file
const PanGestureHandler = (0, _createHandler.default)({
  name: 'PanGestureHandler',
  allowedProps: [..._gestureHandlerCommon.baseGestureHandlerProps, ...panGestureHandlerProps],
  config: {},
  transformProps: managePanProps,
  customNativeProps: panGestureHandlerCustomNativeProps
});
exports.PanGestureHandler = PanGestureHandler;

function validatePanGestureHandlerProps(props) {
  if (Array.isArray(props.activeOffsetX) && (props.activeOffsetX[0] > 0 || props.activeOffsetX[1] < 0)) {
    throw new Error(`First element of activeOffsetX should be negative, a the second one should be positive`);
  }

  if (Array.isArray(props.activeOffsetY) && (props.activeOffsetY[0] > 0 || props.activeOffsetY[1] < 0)) {
    throw new Error(`First element of activeOffsetY should be negative, a the second one should be positive`);
  }

  if (Array.isArray(props.failOffsetX) && (props.failOffsetX[0] > 0 || props.failOffsetX[1] < 0)) {
    throw new Error(`First element of failOffsetX should be negative, a the second one should be positive`);
  }

  if (Array.isArray(props.failOffsetY) && (props.failOffsetY[0] > 0 || props.failOffsetY[1] < 0)) {
    throw new Error(`First element of failOffsetY should be negative, a the second one should be positive`);
  }

  if (props.minDist && (props.failOffsetX || props.failOffsetY)) {
    throw new Error(`It is not supported to use minDist with failOffsetX or failOffsetY, use activeOffsetX and activeOffsetY instead`);
  }

  if (props.minDist && (props.activeOffsetX || props.activeOffsetY)) {
    throw new Error(`It is not supported to use minDist with activeOffsetX or activeOffsetY`);
  }
}

function transformPanGestureHandlerProps(props) {
  const res = { ...props
  };

  if (props.activeOffsetX !== undefined) {
    delete res.activeOffsetX;

    if (Array.isArray(props.activeOffsetX)) {
      res.activeOffsetXStart = props.activeOffsetX[0];
      res.activeOffsetXEnd = props.activeOffsetX[1];
    } else if (props.activeOffsetX < 0) {
      res.activeOffsetXStart = props.activeOffsetX;
    } else {
      res.activeOffsetXEnd = props.activeOffsetX;
    }
  }

  if (props.activeOffsetY !== undefined) {
    delete res.activeOffsetY;

    if (Array.isArray(props.activeOffsetY)) {
      res.activeOffsetYStart = props.activeOffsetY[0];
      res.activeOffsetYEnd = props.activeOffsetY[1];
    } else if (props.activeOffsetY < 0) {
      res.activeOffsetYStart = props.activeOffsetY;
    } else {
      res.activeOffsetYEnd = props.activeOffsetY;
    }
  }

  if (props.failOffsetX !== undefined) {
    delete res.failOffsetX;

    if (Array.isArray(props.failOffsetX)) {
      res.failOffsetXStart = props.failOffsetX[0];
      res.failOffsetXEnd = props.failOffsetX[1];
    } else if (props.failOffsetX < 0) {
      res.failOffsetXStart = props.failOffsetX;
    } else {
      res.failOffsetXEnd = props.failOffsetX;
    }
  }

  if (props.failOffsetY !== undefined) {
    delete res.failOffsetY;

    if (Array.isArray(props.failOffsetY)) {
      res.failOffsetYStart = props.failOffsetY[0];
      res.failOffsetYEnd = props.failOffsetY[1];
    } else if (props.failOffsetY < 0) {
      res.failOffsetYStart = props.failOffsetY;
    } else {
      res.failOffsetYEnd = props.failOffsetY;
    }
  }

  return res;
}

function managePanProps(props) {
  if (__DEV__) {
    validatePanGestureHandlerProps(props);
  }

  return transformPanGestureHandlerProps(props);
}
//# sourceMappingURL=PanGestureHandler.js.map