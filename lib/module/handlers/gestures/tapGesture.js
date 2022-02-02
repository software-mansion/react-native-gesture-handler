function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { BaseGesture } from './gesture';
export class TapGesture extends BaseGesture {
  constructor() {
    super();

    _defineProperty(this, "config", {});

    this.handlerName = 'TapGestureHandler';
  }

  minPointers(minPointers) {
    this.config.minPointers = minPointers;
    return this;
  }

  numberOfTaps(count) {
    this.config.numberOfTaps = count;
    return this;
  }

  maxDistance(maxDist) {
    this.config.maxDist = maxDist;
    return this;
  }

  maxDuration(duration) {
    this.config.maxDurationMs = duration;
    return this;
  }

  maxDelay(delay) {
    this.config.maxDelayMs = delay;
    return this;
  }

  maxDeltaX(delta) {
    this.config.maxDeltaX = delta;
    return this;
  }

  maxDeltaY(delta) {
    this.config.maxDeltaY = delta;
    return this;
  }

}
//# sourceMappingURL=tapGesture.js.map