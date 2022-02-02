"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Gestures = void 0;

var _constants = require("./web/constants");

var _FlingGestureHandler = _interopRequireDefault(require("./web/FlingGestureHandler"));

var _LongPressGestureHandler = _interopRequireDefault(require("./web/LongPressGestureHandler"));

var _NativeViewGestureHandler = _interopRequireDefault(require("./web/NativeViewGestureHandler"));

var NodeManager = _interopRequireWildcard(require("./web/NodeManager"));

var _PanGestureHandler = _interopRequireDefault(require("./web/PanGestureHandler"));

var _PinchGestureHandler = _interopRequireDefault(require("./web/PinchGestureHandler"));

var _RotationGestureHandler = _interopRequireDefault(require("./web/RotationGestureHandler"));

var _TapGestureHandler = _interopRequireDefault(require("./web/TapGestureHandler"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const Gestures = {
  PanGestureHandler: _PanGestureHandler.default,
  RotationGestureHandler: _RotationGestureHandler.default,
  PinchGestureHandler: _PinchGestureHandler.default,
  TapGestureHandler: _TapGestureHandler.default,
  NativeViewGestureHandler: _NativeViewGestureHandler.default,
  LongPressGestureHandler: _LongPressGestureHandler.default,
  FlingGestureHandler: _FlingGestureHandler.default // ForceTouchGestureHandler,

};
exports.Gestures = Gestures;
var _default = {
  Direction: _constants.Direction,

  handleSetJSResponder(tag, blockNativeResponder) {
    console.warn('handleSetJSResponder: ', tag, blockNativeResponder);
  },

  handleClearJSResponder() {
    console.warn('handleClearJSResponder: ');
  },

  createGestureHandler(handlerName, handlerTag, config) {
    //TODO(TS) extends config
    if (!(handlerName in Gestures)) throw new Error(`react-native-gesture-handler: ${handlerName} is not supported on web.`);
    const GestureClass = Gestures[handlerName];
    NodeManager.createGestureHandler(handlerTag, new GestureClass());
    this.updateGestureHandler(handlerTag, config);
  },

  attachGestureHandler(handlerTag, newView, _usingDeviceEvents, propsRef) {
    NodeManager.getHandler(handlerTag).setView(newView, propsRef);
  },

  updateGestureHandler(handlerTag, newConfig) {
    NodeManager.getHandler(handlerTag).updateGestureConfig(newConfig);
  },

  getGestureHandlerNode(handlerTag) {
    return NodeManager.getHandler(handlerTag);
  },

  dropGestureHandler(handlerTag) {
    NodeManager.dropGestureHandler(handlerTag);
  }

};
exports.default = _default;
//# sourceMappingURL=RNGestureHandlerModule.web.js.map