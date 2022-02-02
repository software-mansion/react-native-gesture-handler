function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { BaseGesture } from './gesture';
export class LongPressGesture extends BaseGesture {
  constructor() {
    super();

    _defineProperty(this, "config", {});

    this.handlerName = 'LongPressGestureHandler';
  }

  minDuration(duration) {
    this.config.minDurationMs = duration;
    return this;
  }

  maxDistance(distance) {
    this.config.maxDist = distance;
    return this;
  }

}
//# sourceMappingURL=longPressGesture.js.map