function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { BaseGesture } from './gesture';
export class FlingGesture extends BaseGesture {
  constructor() {
    super();

    _defineProperty(this, "config", {});

    this.handlerName = 'FlingGestureHandler';
  }

  numberOfPointers(pointers) {
    this.config.numberOfPointers = pointers;
    return this;
  }

  direction(direction) {
    this.config.direction = direction;
    return this;
  }

}
//# sourceMappingURL=flingGesture.js.map