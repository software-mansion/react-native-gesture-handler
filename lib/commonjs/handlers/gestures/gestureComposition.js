"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ExclusiveGesture = exports.SimultaneousGesture = exports.ComposedGesture = void 0;

var _gesture = require("./gesture");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function extendRelation(currentRelation, extendWith) {
  if (currentRelation === undefined) {
    return [...extendWith];
  } else {
    return [...currentRelation, ...extendWith];
  }
}

class ComposedGesture extends _gesture.Gesture {
  constructor(...gestures) {
    super();

    _defineProperty(this, "gestures", []);

    _defineProperty(this, "simultaneousGestures", []);

    _defineProperty(this, "requireGesturesToFail", []);

    this.gestures = gestures;
  }

  prepareSingleGesture(gesture, simultaneousGestures, requireGesturesToFail) {
    if (gesture instanceof _gesture.BaseGesture) {
      const newConfig = { ...gesture.config
      };
      newConfig.simultaneousWith = extendRelation(newConfig.simultaneousWith, simultaneousGestures);
      newConfig.requireToFail = extendRelation(newConfig.requireToFail, requireGesturesToFail);
      gesture.config = newConfig;
    } else if (gesture instanceof ComposedGesture) {
      gesture.simultaneousGestures = simultaneousGestures;
      gesture.requireGesturesToFail = requireGesturesToFail;
      gesture.prepare();
    }
  }

  prepare() {
    for (const gesture of this.gestures) {
      this.prepareSingleGesture(gesture, this.simultaneousGestures, this.requireGesturesToFail);
    }
  }

  initialize() {
    for (const gesture of this.gestures) {
      gesture.initialize();
    }
  }

  toGestureArray() {
    return this.gestures.flatMap(gesture => gesture.toGestureArray());
  }

}

exports.ComposedGesture = ComposedGesture;

class SimultaneousGesture extends ComposedGesture {
  prepare() {
    const simultaneousArray = this.gestures.flatMap(gesture => gesture.toGestureArray()).concat(this.simultaneousGestures);

    for (const gesture of this.gestures) {
      this.prepareSingleGesture(gesture, simultaneousArray, this.requireGesturesToFail);
    }
  }

}

exports.SimultaneousGesture = SimultaneousGesture;

class ExclusiveGesture extends ComposedGesture {
  prepare() {
    const gestureArrays = this.gestures.map(gesture => gesture.toGestureArray());
    let requireToFail = [];

    for (let i = 0; i < this.gestures.length; i++) {
      this.prepareSingleGesture(this.gestures[i], this.simultaneousGestures, this.requireGesturesToFail.concat(requireToFail));
      requireToFail = requireToFail.concat(gestureArrays[i]);
    }
  }

}

exports.ExclusiveGesture = ExclusiveGesture;
//# sourceMappingURL=gestureComposition.js.map