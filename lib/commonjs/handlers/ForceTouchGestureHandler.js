"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ForceTouchGestureHandler = exports.forceTouchGestureHandlerProps = void 0;

var _react = _interopRequireDefault(require("react"));

var _PlatformConstants = _interopRequireDefault(require("../PlatformConstants"));

var _createHandler = _interopRequireDefault(require("./createHandler"));

var _gestureHandlerCommon = require("./gestureHandlerCommon");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const forceTouchGestureHandlerProps = ['minForce', 'maxForce', 'feedbackOnActivation'];
exports.forceTouchGestureHandlerProps = forceTouchGestureHandlerProps;

class ForceTouchFallback extends _react.default.Component {
  componentDidMount() {
    console.warn('ForceTouchGestureHandler is not available on this platform. Please use ForceTouchGestureHandler.forceTouchAvailable to conditionally render other components that would provide a fallback behavior specific to your usecase');
  }

  render() {
    return this.props.children;
  }

}

_defineProperty(ForceTouchFallback, "forceTouchAvailable", false);

// eslint-disable-next-line @typescript-eslint/no-redeclare -- backward compatibility; see description on the top of gestureHandlerCommon.ts file
const ForceTouchGestureHandler = _PlatformConstants.default !== null && _PlatformConstants.default !== void 0 && _PlatformConstants.default.forceTouchAvailable ? (0, _createHandler.default)({
  name: 'ForceTouchGestureHandler',
  allowedProps: [..._gestureHandlerCommon.baseGestureHandlerProps, ...forceTouchGestureHandlerProps],
  config: {}
}) : ForceTouchFallback;
exports.ForceTouchGestureHandler = ForceTouchGestureHandler;
ForceTouchGestureHandler.forceTouchAvailable = (_PlatformConstants.default === null || _PlatformConstants.default === void 0 ? void 0 : _PlatformConstants.default.forceTouchAvailable) || false;
//# sourceMappingURL=ForceTouchGestureHandler.js.map