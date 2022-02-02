"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PinchGestureHandler = void 0;

var _createHandler = _interopRequireDefault(require("./createHandler"));

var _gestureHandlerCommon = require("./gestureHandlerCommon");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// eslint-disable-next-line @typescript-eslint/no-redeclare -- backward compatibility; see description on the top of gestureHandlerCommon.ts file
const PinchGestureHandler = (0, _createHandler.default)({
  name: 'PinchGestureHandler',
  allowedProps: _gestureHandlerCommon.baseGestureHandlerProps,
  config: {}
});
exports.PinchGestureHandler = PinchGestureHandler;
//# sourceMappingURL=PinchGestureHandler.js.map