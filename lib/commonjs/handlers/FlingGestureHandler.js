"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FlingGestureHandler = exports.flingGestureHandlerProps = void 0;

var _createHandler = _interopRequireDefault(require("./createHandler"));

var _gestureHandlerCommon = require("./gestureHandlerCommon");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const flingGestureHandlerProps = ['numberOfPointers', 'direction'];
exports.flingGestureHandlerProps = flingGestureHandlerProps;
// eslint-disable-next-line @typescript-eslint/no-redeclare -- backward compatibility; see description on the top of gestureHandlerCommon.ts file
const FlingGestureHandler = (0, _createHandler.default)({
  name: 'FlingGestureHandler',
  allowedProps: [..._gestureHandlerCommon.baseGestureHandlerProps, ...flingGestureHandlerProps],
  config: {}
});
exports.FlingGestureHandler = FlingGestureHandler;
//# sourceMappingURL=FlingGestureHandler.js.map