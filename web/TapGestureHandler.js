import Hammer from 'hammerjs';

import DiscreteGestureHandler from './DiscreteGestureHandler';
import { isnan } from './utils';

class TapGestureHandler extends DiscreteGestureHandler {
  get name() {
    return 'tap';
  }

  createNativeGesture({ numberOfTaps, minPointers }) {
    return new Hammer.Tap({
      taps: numberOfTaps,
      event: this.name,
      pointers: minPointers,
    });
  }

  simulateCancelEvent(inputData) {
    if (this.isGestureRunning) {
      this._cancelEvent(inputData);
    }
  }

  onMainEvent(ev) {
    console.log('onMainEvent');
    if (this.isGestureRunning) {
      this._onSuccessfulTap(ev);
    } else {
      // Prevent multiple-touches
      console.log('tap.prevent multi');
    }
  }

  _onSuccessfulTap = ev => {
    if (this._getPendingGestures().length) {
      this._shouldFireEndEvent = ev;
      return;
    }
    if (ev.eventType === Hammer.INPUT_END) {
      this._sendEvent({ ...ev, eventType: Hammer.INPUT_MOVE });
    }
    // When handler gets activated it will turn into State.END immediately.
    this._sendEvent({ ...ev, isFinal: true });
    this._onEnd(ev);
  };

  get maxDelayMs() {
    return isnan(this.config.maxDelayMs) ? 300 : this.config.maxDelayMs;
  }

  onRawEvent(ev) {
    super.onRawEvent(ev);

    // Attempt to create a touch-down event by checking if a valid tap hasn't started yet, then validating the input.
    if (
      !this.hasGestureFailed &&
      !this.isGestureRunning &&
      // Prevent multi-pointer events from misfiring.
      !ev.isFinal
    ) {
      // Tap Gesture start event
      const gesture = this.hammer.get(this.name);
      if (gesture.options.enable(gesture, ev)) {
        clearTimeout(this._multiTapTimer);

        this.onStart(ev);
        this._sendEvent(ev);
      }
    }
    if (ev.isFinal && ev.maxPointers > 1) {
      setTimeout(() => {
        // Handle case where one finger presses slightly
        // after the first finger on a multi-tap event
        if (this.isGestureRunning) {
          this._cancelEvent(ev);
        }
      });
    }

    if (this.hasGestureFailed) {
      return;
    }
    // Hammer doesn't send a `cancel` event for taps.
    // Manually fail the event.
    if (ev.isFinal) {
      // Handle case where one finger presses slightly
      // after the first finger on a multi-tap event
      if (ev.maxPointers > 1) {
        setTimeout(() => {
          if (this.isGestureRunning) {
            this._cancelEvent(ev);
          }
        });
      }

      // Clear last timer
      clearTimeout(this._timer);
      // Create time out for multi-taps.
      this._timer = setTimeout(() => {
        this.hasGestureFailed = true;
        this._cancelEvent(ev);
      }, this.maxDelayMs);
    } else if (!this.hasGestureFailed && !this.isGestureRunning) {
      // Tap Gesture start event
      const gesture = this.hammer.get(this.name);
      if (gesture.options.enable(gesture, ev)) {
        clearTimeout(this._multiTapTimer);

        this.onStart(ev);
        this._sendEvent(ev);
      }
    }
  }

  _getHammerConfig() {
    return {
      ...super._getHammerConfig(),
      taps: isnan(this.config.numberOfTaps) ? 1 : this.config.numberOfTaps,
      interval: this.maxDelayMs,
      time:
        isnan(this.config.maxDurationMs) || this.config.maxDurationMs == null
          ? 250
          : this.config.maxDurationMs,
    };
  }

  updateGestureConfig({
    shouldCancelWhenOutside = true,
    maxDeltaX = Number.NaN,
    maxDeltaY = Number.NaN,
    numberOfTaps = 1,
    minDurationMs = 525,
    maxDelayMs = Number.NaN,
    maxDurationMs = Number.NaN,
    maxDist = 2,
    minPointers = 1,
    maxPointers = 1,
    ...props
  }) {
    return super.updateGestureConfig({
      shouldCancelWhenOutside,
      numberOfTaps,
      maxDeltaX,
      maxDeltaY,
      minDurationMs,
      maxDelayMs,
      maxDist,
      minPointers,
      maxPointers,
      ...props,
    });
  }

  _onEnd(...props) {
    clearTimeout(this._timer);
    super._onEnd(...props);
  }

  onWaitingEnded(gesture) {
    if (this._shouldFireEndEvent) {
      this._onSuccessfulTap(this._shouldFireEndEvent);
      this._shouldFireEndEvent = null;
    }
  }
}
export default TapGestureHandler;
