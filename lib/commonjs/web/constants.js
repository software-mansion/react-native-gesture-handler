"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HammerDirectionNames = exports.HammerInputNames = exports.DirectionMap = exports.Direction = exports.EventMap = exports.DEG_RAD = exports.MULTI_FINGER_PAN_MAX_ROTATION_THRESHOLD = exports.MULTI_FINGER_PAN_MAX_PINCH_THRESHOLD = exports.CONTENT_TOUCHES_QUICK_TAP_END_DELAY = exports.CONTENT_TOUCHES_DELAY = void 0;

var _hammerjs = _interopRequireDefault(require("@egjs/hammerjs"));

var _State = require("../State");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const CONTENT_TOUCHES_DELAY = 240;
exports.CONTENT_TOUCHES_DELAY = CONTENT_TOUCHES_DELAY;
const CONTENT_TOUCHES_QUICK_TAP_END_DELAY = 50;
exports.CONTENT_TOUCHES_QUICK_TAP_END_DELAY = CONTENT_TOUCHES_QUICK_TAP_END_DELAY;
const MULTI_FINGER_PAN_MAX_PINCH_THRESHOLD = 0.1;
exports.MULTI_FINGER_PAN_MAX_PINCH_THRESHOLD = MULTI_FINGER_PAN_MAX_PINCH_THRESHOLD;
const MULTI_FINGER_PAN_MAX_ROTATION_THRESHOLD = 7;
exports.MULTI_FINGER_PAN_MAX_ROTATION_THRESHOLD = MULTI_FINGER_PAN_MAX_ROTATION_THRESHOLD;
const DEG_RAD = Math.PI / 180; // Map Hammer values to RNGH

exports.DEG_RAD = DEG_RAD;
const EventMap = {
  [_hammerjs.default.INPUT_START]: _State.State.BEGAN,
  [_hammerjs.default.INPUT_MOVE]: _State.State.ACTIVE,
  [_hammerjs.default.INPUT_END]: _State.State.END,
  [_hammerjs.default.INPUT_CANCEL]: _State.State.FAILED
};
exports.EventMap = EventMap;
const Direction = {
  RIGHT: 1,
  LEFT: 2,
  UP: 4,
  DOWN: 8
};
exports.Direction = Direction;
const DirectionMap = {
  [_hammerjs.default.DIRECTION_RIGHT]: Direction.RIGHT,
  [_hammerjs.default.DIRECTION_LEFT]: Direction.LEFT,
  [_hammerjs.default.DIRECTION_UP]: Direction.UP,
  [_hammerjs.default.DIRECTION_DOWN]: Direction.DOWN
};
exports.DirectionMap = DirectionMap;
const HammerInputNames = {
  [_hammerjs.default.INPUT_START]: 'START',
  [_hammerjs.default.INPUT_MOVE]: 'MOVE',
  [_hammerjs.default.INPUT_END]: 'END',
  [_hammerjs.default.INPUT_CANCEL]: 'CANCEL'
};
exports.HammerInputNames = HammerInputNames;
const HammerDirectionNames = {
  [_hammerjs.default.DIRECTION_HORIZONTAL]: 'HORIZONTAL',
  [_hammerjs.default.DIRECTION_UP]: 'UP',
  [_hammerjs.default.DIRECTION_DOWN]: 'DOWN',
  [_hammerjs.default.DIRECTION_VERTICAL]: 'VERTICAL',
  [_hammerjs.default.DIRECTION_NONE]: 'NONE',
  [_hammerjs.default.DIRECTION_ALL]: 'ALL',
  [_hammerjs.default.DIRECTION_RIGHT]: 'RIGHT',
  [_hammerjs.default.DIRECTION_LEFT]: 'LEFT'
};
exports.HammerDirectionNames = HammerDirectionNames;
//# sourceMappingURL=constants.js.map