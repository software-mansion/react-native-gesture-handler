import Hammer from 'hammerjs';
import DiscreteGestureHandler from './DiscreteGestureHandler';
import { isnan, fireAfterInterval } from './utils';
import { CONTENT_TOUCHES_QUICK_TAP_END_DELAY, CONTENT_TOUCHES_DELAY } from './constants';
import State from '../State';

class PressGestureHandler extends DiscreteGestureHandler {
  get name() {
    return 'press';
  }

  simulateCancelEvent(inputData) {
    // Long press never starts so we can't rely on the running event boolean.
    this.hasGestureFailed = true;
    this._cancelEvent(inputData);
  }

  get minDurationMs() {
    return isnan(this.config.minDurationMs) ? 5 : this.config.minDurationMs;
  }

  get maxDist() {
    return isnan(this.config.maxDist) ? 9 : this.config.maxDist;
  }

  shouldDelayTouches = true;

  updateHasCustomActivationCriteria({ shouldCancelWhenOutside, maxDistSq }) {
    return shouldCancelWhenOutside || !isnan(maxDistSq);
  }

  getState(type) {
    return {
      [Hammer.INPUT_START]: State.BEGAN,
      [Hammer.INPUT_MOVE]: State.ACTIVE,
      [Hammer.INPUT_END]: State.END,
      [Hammer.INPUT_CANCEL]: State.CANCELLED,
    }[type];
  }

  getConfig() {
    if (!this._hasCustomActivationCriteria) {
      // Default config
      // If no params have been defined then this config should emulate the native gesture as closely as possible.
      return {
        shouldCancelWhenOutside: true,
        maxDistSq: 10,
      };
    }
    return this.config;
  }

  _getHammerConfig() {
    return {
      ...super._getHammerConfig(),
      // threshold: this.maxDist,
      time: this.minDurationMs,
    };
  }

  onMainEvent(ev) {
    this._onGestureStart(ev);
  }

  shouldDelayTouchForEvent({ pointerType }) {
    // Don't disable event for mouse input
    return this.shouldDelayTouches && pointerType === 'touch';
  }

  _onGestureStart(ev) {
    this.isGestureRunning = true;
    clearTimeout(this._delaysContentTouchesTimer);
    this._initialEvent = ev;
    this._delaysContentTouchesTimer = fireAfterInterval(() => {
      this._sendGestureStartedEvent(this._initialEvent);
      this._initialEvent = null;
    }, this.shouldDelayTouchForEvent(ev) && CONTENT_TOUCHES_DELAY);
  }

  _sendGestureStartedEvent(ev) {
    clearTimeout(this._delaysContentTouchesTimer);
    this._delaysContentTouchesTimer = null;
    this._sendEvent({
      ...ev,
      eventType: Hammer.INPUT_MOVE,
      isFirst: true,
    });
  }

  forceInvalidate(event) {
    super.forceInvalidate(event);
    clearTimeout(this._delaysContentTouchesTimer);
    this._delaysContentTouchesTimer = null;
    this._initialEvent = null;
  }

  onRawEvent(ev) {
    super.onRawEvent(ev);
    if (ev.isFinal && this.isGestureRunning) {
      let timeout;
      if (this._delaysContentTouchesTimer) {
        // Aesthetic timing for a quick tap.
        // We haven't activated the tap right away to emulate iOS `delaysContentTouches`
        // Now we must send the initial activation event and wait a set amount of time before firing the end event.
        timeout = CONTENT_TOUCHES_QUICK_TAP_END_DELAY;
        this._sendGestureStartedEvent(this._initialEvent);
        this._initialEvent = null;
      }
      fireAfterInterval(() => {
        this._sendEvent({
          ...ev,
          eventType: Hammer.INPUT_END,
          isFinal: true,
        });
        this._onEnd();
      }, timeout);
    }
  }

  updateGestureConfig({
    shouldActivateOnStart = false,
    disallowInterruption = false,
    shouldCancelWhenOutside = true,
    minDurationMs = Number.NaN,
    maxDist = Number.NaN,
    minPointers = 1,
    maxPointers = 1,
    ...props
  }) {
    return super.updateGestureConfig({
      shouldActivateOnStart,
      disallowInterruption,
      shouldCancelWhenOutside,
      minDurationMs,
      maxDist,
      minPointers,
      maxPointers,
      ...props,
    });
  }

  createNativeGesture({ manager, props }) {
    manager.add(new Hammer.Press({ pointers: props.minPointers }));
  }
}
export default PressGestureHandler;
