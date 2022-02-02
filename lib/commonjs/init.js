"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initialize = initialize;

var _eventReceiver = require("./handlers/gestures/eventReceiver");

function initialize() {
  (0, _eventReceiver.startListening)();
}
//# sourceMappingURL=init.js.map