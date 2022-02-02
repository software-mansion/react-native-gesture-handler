function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { BaseGesture } from './gesture';
export class NativeGesture extends BaseGesture {
  constructor() {
    super();

    _defineProperty(this, "config", {});

    this.handlerName = 'NativeViewGestureHandler';
  }

  shouldActivateOnStart(value) {
    this.config.shouldActivateOnStart = value;
    return this;
  }

  disallowInterruption(value) {
    this.config.disallowInterruption = value;
    return this;
  }

}
//# sourceMappingURL=nativeGesture.js.map