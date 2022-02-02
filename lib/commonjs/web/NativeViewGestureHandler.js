"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _DiscreteGestureHandler = _interopRequireDefault(require("./DiscreteGestureHandler"));

var NodeManager = _interopRequireWildcard(require("./NodeManager"));

var _PressGestureHandler = _interopRequireDefault(require("./PressGestureHandler"));

var _utils = require("./utils");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class NativeViewGestureHandler extends _PressGestureHandler.default {
  onRawEvent(ev) {
    super.onRawEvent(ev);

    if (!ev.isFinal) {
      // if (this.ref instanceof ScrollView) {
      if ((0, _utils.TEST_MIN_IF_NOT_NAN)((0, _utils.VEC_LEN_SQ)({
        x: ev.deltaX,
        y: ev.deltaY
      }), 10)) {
        // @ts-ignore FIXME(TS) config type
        if (this.config.disallowInterruption) {
          const gestures = Object.values(NodeManager.getNodes()).filter(gesture => {
            const {
              handlerTag,
              view,
              isGestureRunning
            } = gesture;
            return (// Check if this gesture isn't self
              handlerTag !== this.handlerTag && // Ensure the gesture needs to be cancelled
              isGestureRunning && // ScrollView can cancel discrete gestures like taps and presses
              gesture instanceof _DiscreteGestureHandler.default && // Ensure a view exists and is a child of the current view
              view && // @ts-ignore FIXME(TS) view type
              this.view.contains(view)
            );
          }); // Cancel all of the gestures that passed the filter

          for (const gesture of gestures) {
            // TODO: Bacon: Send some cached event.
            gesture.forceInvalidate(ev);
          }
        }
      }
    }
  }

}

var _default = NativeViewGestureHandler;
exports.default = _default;
//# sourceMappingURL=NativeViewGestureHandler.js.map