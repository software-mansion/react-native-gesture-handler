import { State } from '../../State';
import { DEFAULT_TOUCH_SLOP } from '../constants';
import { AdaptedEvent, Config, StylusData, WheelDevice } from '../interfaces';

import GestureHandler from './GestureHandler';

const DEFAULT_MIN_POINTERS = 1;
const DEFAULT_MAX_POINTERS = 10;
const DEFAULT_MIN_DIST_SQ = DEFAULT_TOUCH_SLOP * DEFAULT_TOUCH_SLOP;

const PAN_CUSTOM_ACTIVATION_PROPERTIES = [
  'activeOffsetXStart',
  'activeOffsetXEnd',
  'failOffsetXStart',
  'failOffsetXEnd',
  'activeOffsetYStart',
  'activeOffsetYEnd',
  'failOffsetYStart',
  'failOffsetYEnd',
  'minVelocityX',
  'minVelocityY',
  'minVelocity',
];

export default class PanGestureHandler extends GestureHandler {
  private _velocityX = 0;
  get velocityX() {
    return this._velocityX;
  }
  set velocityX(value: number) {
    this._velocityX = value;
  }

  private _velocityY = 0;
  get velocityY() {
    return this._velocityY;
  }
  set velocityY(value: number) {
    this._velocityY = value;
  }

  private _minDistSq = DEFAULT_MIN_DIST_SQ;
  get minDistSq() {
    return this._minDistSq;
  }
  set minDistSq(value: number) {
    this._minDistSq = value;
  }

  private _activeOffsetXStart = -Number.MAX_SAFE_INTEGER;
  get activeOffsetXStart() {
    return this._activeOffsetXStart;
  }
  set activeOffsetXStart(value: number) {
    this._activeOffsetXStart = value;
  }

  private _activeOffsetXEnd = Number.MIN_SAFE_INTEGER;
  get activeOffsetXEnd() {
    return this._activeOffsetXEnd;
  }
  set activeOffsetXEnd(value: number) {
    this._activeOffsetXEnd = value;
  }

  private _failOffsetXStart = Number.MIN_SAFE_INTEGER;
  get failOffsetXStart() {
    return this._failOffsetXStart;
  }
  set failOffsetXStart(value: number) {
    this._failOffsetXStart = value;
  }

  private _failOffsetXEnd = Number.MAX_SAFE_INTEGER;
  get failOffsetXEnd() {
    return this._failOffsetXEnd;
  }
  set failOffsetXEnd(value: number) {
    this._failOffsetXEnd = value;
  }

  private _activeOffsetYStart = Number.MAX_SAFE_INTEGER;
  get activeOffsetYStart() {
    return this._activeOffsetYStart;
  }
  set activeOffsetYStart(value: number) {
    this._activeOffsetYStart = value;
  }

  private _activeOffsetYEnd = Number.MIN_SAFE_INTEGER;
  get activeOffsetYEnd() {
    return this._activeOffsetYEnd;
  }
  set activeOffsetYEnd(value: number) {
    this._activeOffsetYEnd = value;
  }

  private _failOffsetYStart = Number.MIN_SAFE_INTEGER;
  get failOffsetYStart() {
    return this._failOffsetYStart;
  }
  set failOffsetYStart(value: number) {
    this._failOffsetYStart = value;
  }

  private _failOffsetYEnd = Number.MAX_SAFE_INTEGER;
  get failOffsetYEnd() {
    return this._failOffsetYEnd;
  }
  set failOffsetYEnd(value: number) {
    this._failOffsetYEnd = value;
  }

  private _minVelocityX = Number.MAX_SAFE_INTEGER;
  get minVelocityX() {
    return this._minVelocityX;
  }
  set minVelocityX(value: number) {
    this._minVelocityX = value;
  }

  private _minVelocityY = Number.MAX_SAFE_INTEGER;
  get minVelocityY() {
    return this._minVelocityY;
  }
  set minVelocityY(value: number) {
    this._minVelocityY = value;
  }

  private _minVelocitySq = Number.MAX_SAFE_INTEGER;
  get minVelocitySq() {
    return this._minVelocitySq;
  }
  set minVelocitySq(value: number) {
    this._minVelocitySq = value;
  }

  private _minPointers = DEFAULT_MIN_POINTERS;
  get minPointers() {
    return this._minPointers;
  }
  set minPointers(value: number) {
    this._minPointers = value;
  }

  private _maxPointers = DEFAULT_MAX_POINTERS;
  get maxPointers() {
    return this._maxPointers;
  }
  set maxPointers(value: number) {
    this._maxPointers = value;
  }

  private _startX = 0;
  get startX() {
    return this._startX;
  }
  set startX(value: number) {
    this._startX = value;
  }

  private _startY = 0;
  get startY() {
    return this._startY;
  }
  set startY(value: number) {
    this._startY = value;
  }

  private _offsetX = 0;
  get offsetX() {
    return this._offsetX;
  }
  set offsetX(value: number) {
    this._offsetX = value;
  }

  private _offsetY = 0;
  get offsetY() {
    return this._offsetY;
  }
  set offsetY(value: number) {
    this._offsetY = value;
  }

  private _lastX = 0;
  get lastX() {
    return this._lastX;
  }
  set lastX(value: number) {
    this._lastX = value;
  }

  private _lastY = 0;
  get lastY() {
    return this._lastY;
  }
  set lastY(value: number) {
    this._lastY = value;
  }

  private _stylusData: StylusData | undefined;
  get stylusData() {
    return this._stylusData;
  }
  set stylusData(value: StylusData | undefined) {
    this._stylusData = value;
  }

  private _activateAfterLongPress = 0;
  get activateAfterLongPress() {
    return this._activateAfterLongPress;
  }
  set activateAfterLongPress(value: number) {
    this._activateAfterLongPress = value;
  }

  private _activationTimeout = 0;
  get activationTimeout() {
    return this._activationTimeout;
  }
  set activationTimeout(value: number) {
    this._activationTimeout = value;
  }

  private _enableTrackpadTwoFingerGesture = false;
  get enableTrackpadTwoFingerGesture() {
    return this._enableTrackpadTwoFingerGesture;
  }
  set enableTrackpadTwoFingerGesture(value: boolean) {
    this._enableTrackpadTwoFingerGesture = value;
  }

  private _endWheelTimeout = 0;
  get endWheelTimeout() {
    return this._endWheelTimeout;
  }
  set endWheelTimeout(value: number) {
    this._endWheelTimeout = value;
  }

  private _wheelDevice = WheelDevice.UNDETERMINED;
  get wheelDevice() {
    return this._wheelDevice;
  }
  set wheelDevice(value: WheelDevice) {
    this._wheelDevice = value;
  }

  public init(ref: number, propsRef: React.RefObject<unknown>): void {
    super.init(ref, propsRef);
  }

  public updateGestureConfig({ enabled = true, ...props }: Config): void {
    this.resetConfig();

    super.updateGestureConfig({ enabled: enabled, ...props });
    this.checkCustomActivationCriteria(PAN_CUSTOM_ACTIVATION_PROPERTIES);

    if (this.config.minDist !== undefined) {
      this.minDistSq = this.config.minDist * this.config.minDist;
    } else if (this.hasCustomActivationCriteria) {
      this.minDistSq = Number.MAX_SAFE_INTEGER;
    }

    if (this.config.minPointers !== undefined) {
      this.minPointers = this.config.minPointers;
    }

    if (this.config.maxPointers !== undefined) {
      this.maxPointers = this.config.maxPointers;
    }

    if (this.config.minVelocity !== undefined) {
      this.minVelocityX = this.config.minVelocity;
      this.minVelocityY = this.config.minVelocity;
    }

    if (this.config.minVelocityX !== undefined) {
      this.minVelocityX = this.config.minVelocityX;
    }

    if (this.config.minVelocityY !== undefined) {
      this.minVelocityY = this.config.minVelocityY;
    }

    if (this.config.activateAfterLongPress !== undefined) {
      this.activateAfterLongPress = this.config.activateAfterLongPress;
    }

    if (this.config.activeOffsetXStart !== undefined) {
      this.activeOffsetXStart = this.config.activeOffsetXStart;

      if (this.config.activeOffsetXEnd === undefined) {
        this.activeOffsetXEnd = Number.MAX_SAFE_INTEGER;
      }
    }

    if (this.config.activeOffsetXEnd !== undefined) {
      this.activeOffsetXEnd = this.config.activeOffsetXEnd;

      if (this.config.activeOffsetXStart === undefined) {
        this.activeOffsetXStart = Number.MIN_SAFE_INTEGER;
      }
    }

    if (this.config.failOffsetXStart !== undefined) {
      this.failOffsetXStart = this.config.failOffsetXStart;

      if (this.config.failOffsetXEnd === undefined) {
        this.failOffsetXEnd = Number.MAX_SAFE_INTEGER;
      }
    }

    if (this.config.failOffsetXEnd !== undefined) {
      this.failOffsetXEnd = this.config.failOffsetXEnd;

      if (this.config.failOffsetXStart === undefined) {
        this.failOffsetXStart = Number.MIN_SAFE_INTEGER;
      }
    }

    if (this.config.activeOffsetYStart !== undefined) {
      this.activeOffsetYStart = this.config.activeOffsetYStart;

      if (this.config.activeOffsetYEnd === undefined) {
        this.activeOffsetYEnd = Number.MAX_SAFE_INTEGER;
      }
    }

    if (this.config.activeOffsetYEnd !== undefined) {
      this.activeOffsetYEnd = this.config.activeOffsetYEnd;

      if (this.config.activeOffsetYStart === undefined) {
        this.activeOffsetYStart = Number.MIN_SAFE_INTEGER;
      }
    }

    if (this.config.failOffsetYStart !== undefined) {
      this.failOffsetYStart = this.config.failOffsetYStart;

      if (this.config.failOffsetYEnd === undefined) {
        this.failOffsetYEnd = Number.MAX_SAFE_INTEGER;
      }
    }

    if (this.config.failOffsetYEnd !== undefined) {
      this.failOffsetYEnd = this.config.failOffsetYEnd;

      if (this.config.failOffsetYStart === undefined) {
        this.failOffsetYStart = Number.MIN_SAFE_INTEGER;
      }
    }

    if (this.config.enableTrackpadTwoFingerGesture !== undefined) {
      this.enableTrackpadTwoFingerGesture =
        this.config.enableTrackpadTwoFingerGesture;
    }
  }

  protected resetConfig(): void {
    super.resetConfig();

    this.activeOffsetXStart = -Number.MAX_SAFE_INTEGER;
    this.activeOffsetXEnd = Number.MIN_SAFE_INTEGER;
    this.failOffsetXStart = Number.MIN_SAFE_INTEGER;
    this.failOffsetXEnd = Number.MAX_SAFE_INTEGER;

    this.activeOffsetYStart = Number.MAX_SAFE_INTEGER;
    this.activeOffsetYEnd = Number.MIN_SAFE_INTEGER;
    this.failOffsetYStart = Number.MIN_SAFE_INTEGER;
    this.failOffsetYEnd = Number.MAX_SAFE_INTEGER;

    this.minVelocityX = Number.MAX_SAFE_INTEGER;
    this.minVelocityY = Number.MAX_SAFE_INTEGER;
    this.minVelocitySq = Number.MAX_SAFE_INTEGER;

    this.minDistSq = DEFAULT_MIN_DIST_SQ;

    this.minPointers = DEFAULT_MIN_POINTERS;
    this.maxPointers = DEFAULT_MAX_POINTERS;

    this.activateAfterLongPress = 0;
  }

  protected transformNativeEvent() {
    const translationX: number = this.getTranslationX();
    const translationY: number = this.getTranslationY();

    return {
      ...super.transformNativeEvent(),
      translationX: isNaN(translationX) ? 0 : translationX,
      translationY: isNaN(translationY) ? 0 : translationY,
      velocityX: this.velocityX,
      velocityY: this.velocityY,
      stylusData: this.stylusData,
    };
  }

  private getTranslationX(): number {
    return this.lastX - this.startX + this.offsetX;
  }
  private getTranslationY(): number {
    return this.lastY - this.startY + this.offsetY;
  }

  private clearActivationTimeout(): void {
    clearTimeout(this.activationTimeout);
  }

  // Events Handling
  protected onPointerDown(event: AdaptedEvent): void {
    if (!this.isButtonInConfig(event.button)) {
      return;
    }

    this.pointerTracker.addToTracker(event);
    this.stylusData = event.stylusData;

    super.onPointerDown(event);

    const lastCoords = this.pointerTracker.getAbsoluteCoordsAverage();
    this.lastX = lastCoords.x;
    this.lastY = lastCoords.y;

    this.startX = this.lastX;
    this.startY = this.lastY;

    this.tryBegin(event);
    this.checkBegan();

    this.tryToSendTouchEvent(event);
  }

  protected onPointerAdd(event: AdaptedEvent): void {
    this.pointerTracker.addToTracker(event);
    super.onPointerAdd(event);
    this.tryBegin(event);

    this.offsetX += this.lastX - this.startX;
    this.offsetY += this.lastY - this.startY;

    const lastCoords = this.pointerTracker.getAbsoluteCoordsAverage();
    this.lastX = lastCoords.x;
    this.lastY = lastCoords.y;

    this.startX = this.lastX;
    this.startY = this.lastY;

    if (this.pointerTracker.getTrackedPointersCount() > this.maxPointers) {
      if (this.state === State.ACTIVE) {
        this.cancel();
      } else {
        this.fail();
      }
    } else {
      this.checkBegan();
    }
  }

  protected onPointerUp(event: AdaptedEvent): void {
    this.stylusData = event.stylusData;

    super.onPointerUp(event);
    if (this.state === State.ACTIVE) {
      const lastCoords = this.pointerTracker.getAbsoluteCoordsAverage();
      this.lastX = lastCoords.x;
      this.lastY = lastCoords.y;
    }

    this.pointerTracker.removeFromTracker(event.pointerId);

    if (this.pointerTracker.getTrackedPointersCount() === 0) {
      this.clearActivationTimeout();
    }

    if (this.state === State.ACTIVE) {
      this.end();
    } else {
      this.resetProgress();
      this.fail();
    }
  }

  protected onPointerRemove(event: AdaptedEvent): void {
    super.onPointerRemove(event);
    this.pointerTracker.removeFromTracker(event.pointerId);

    this.offsetX += this.lastX - this.startX;
    this.offsetY += this.lastY - this.startY;

    const lastCoords = this.pointerTracker.getAbsoluteCoordsAverage();
    this.lastX = lastCoords.x;
    this.lastY = lastCoords.y;

    this.startX = this.lastX;
    this.startY = this.lastY;

    if (
      !(
        this.state === State.ACTIVE &&
        this.pointerTracker.getTrackedPointersCount() < this.minPointers
      )
    ) {
      this.checkBegan();
    }
  }

  protected onPointerMove(event: AdaptedEvent): void {
    this.pointerTracker.track(event);
    this.stylusData = event.stylusData;

    const lastCoords = this.pointerTracker.getAbsoluteCoordsAverage();
    this.lastX = lastCoords.x;
    this.lastY = lastCoords.y;

    const velocity = this.pointerTracker.getVelocity(event.pointerId);
    this.velocityX = velocity.x;
    this.velocityY = velocity.y;

    this.checkBegan();

    super.onPointerMove(event);
  }

  protected onPointerOutOfBounds(event: AdaptedEvent): void {
    if (this.shouldCancelWhenOutside) {
      return;
    }

    this.pointerTracker.track(event);
    this.stylusData = event.stylusData;

    const lastCoords = this.pointerTracker.getAbsoluteCoordsAverage();
    this.lastX = lastCoords.x;
    this.lastY = lastCoords.y;

    const velocity = this.pointerTracker.getVelocity(event.pointerId);
    this.velocityX = velocity.x;
    this.velocityY = velocity.y;

    this.checkBegan();

    if (this.state === State.ACTIVE) {
      super.onPointerOutOfBounds(event);
    }
  }

  private scheduleWheelEnd(event: AdaptedEvent) {
    clearTimeout(this.endWheelTimeout);

    this.endWheelTimeout = setTimeout(() => {
      if (this.state === State.ACTIVE) {
        this.end();
        this.pointerTracker.removeFromTracker(event.pointerId);
        this.state = State.UNDETERMINED;
      }

      this.wheelDevice = WheelDevice.UNDETERMINED;
    }, 30);
  }

  protected onWheel(event: AdaptedEvent): void {
    if (
      this.wheelDevice === WheelDevice.MOUSE ||
      !this.enableTrackpadTwoFingerGesture
    ) {
      return;
    }

    if (this.state === State.UNDETERMINED) {
      this.wheelDevice =
        event.wheelDeltaY! % 120 !== 0
          ? WheelDevice.TOUCHPAD
          : WheelDevice.MOUSE;

      if (this.wheelDevice === WheelDevice.MOUSE) {
        this.scheduleWheelEnd(event);
        return;
      }

      this.pointerTracker.addToTracker(event);

      const lastCoords = this.pointerTracker.getAbsoluteCoordsAverage();
      this.lastX = lastCoords.x;
      this.lastY = lastCoords.y;

      this.startX = this.lastX;
      this.startY = this.lastY;

      this.begin();
      this.activate();
    }
    this.pointerTracker.track(event);

    const lastCoords = this.pointerTracker.getAbsoluteCoordsAverage();
    this.lastX = lastCoords.x;
    this.lastY = lastCoords.y;

    const velocity = this.pointerTracker.getVelocity(event.pointerId);
    this.velocityX = velocity.x;
    this.velocityY = velocity.y;

    this.tryToSendMoveEvent(false, event);
    this.scheduleWheelEnd(event);
  }

  private shouldActivate(): boolean {
    const dx: number = this.getTranslationX();

    if (
      this.activeOffsetXStart !== Number.MAX_SAFE_INTEGER &&
      dx < this.activeOffsetXStart
    ) {
      return true;
    }

    if (
      this.activeOffsetXEnd !== Number.MIN_SAFE_INTEGER &&
      dx > this.activeOffsetXEnd
    ) {
      return true;
    }

    const dy: number = this.getTranslationY();

    if (
      this.activeOffsetYStart !== Number.MAX_SAFE_INTEGER &&
      dy < this.activeOffsetYStart
    ) {
      return true;
    }

    if (
      this.activeOffsetYEnd !== Number.MIN_SAFE_INTEGER &&
      dy > this.activeOffsetYEnd
    ) {
      return true;
    }

    const distanceSq: number = dx * dx + dy * dy;

    if (
      this.minDistSq !== Number.MAX_SAFE_INTEGER &&
      distanceSq >= this.minDistSq
    ) {
      return true;
    }

    const vx: number = this.velocityX;

    if (
      this.minVelocityX !== Number.MAX_SAFE_INTEGER &&
      ((this.minVelocityX < 0 && vx <= this.minVelocityX) ||
        (this.minVelocityX >= 0 && this.minVelocityX <= vx))
    ) {
      return true;
    }

    const vy: number = this.velocityY;
    if (
      this.minVelocityY !== Number.MAX_SAFE_INTEGER &&
      ((this.minVelocityY < 0 && vy <= this.minVelocityY) ||
        (this.minVelocityY >= 0 && this.minVelocityY <= vy))
    ) {
      return true;
    }

    const velocitySq: number = vx * vx + vy * vy;

    return (
      this.minVelocitySq !== Number.MAX_SAFE_INTEGER &&
      velocitySq >= this.minVelocitySq
    );
  }

  private shouldFail(): boolean {
    const dx: number = this.getTranslationX();
    const dy: number = this.getTranslationY();
    const distanceSq = dx * dx + dy * dy;

    if (this.activateAfterLongPress > 0 && distanceSq > DEFAULT_MIN_DIST_SQ) {
      this.clearActivationTimeout();
      return true;
    }

    if (
      this.failOffsetXStart !== Number.MIN_SAFE_INTEGER &&
      dx < this.failOffsetXStart
    ) {
      return true;
    }

    if (
      this.failOffsetXEnd !== Number.MAX_SAFE_INTEGER &&
      dx > this.failOffsetXEnd
    ) {
      return true;
    }

    if (
      this.failOffsetYStart !== Number.MIN_SAFE_INTEGER &&
      dy < this.failOffsetYStart
    ) {
      return true;
    }

    return (
      this.failOffsetYEnd !== Number.MAX_SAFE_INTEGER &&
      dy > this.failOffsetYEnd
    );
  }

  private tryBegin(event: AdaptedEvent): void {
    if (
      this.state === State.UNDETERMINED &&
      this.pointerTracker.getTrackedPointersCount() >= this.minPointers
    ) {
      this.resetProgress();
      this.offsetX = 0;
      this.offsetY = 0;
      this.velocityX = 0;
      this.velocityY = 0;

      this.begin();

      if (this.activateAfterLongPress > 0) {
        this.activationTimeout = setTimeout(() => {
          this.activate();
        }, this.activateAfterLongPress);
      }
    } else {
      const velocity = this.pointerTracker.getVelocity(event.pointerId);
      this.velocityX = velocity.x;
      this.velocityY = velocity.y;
    }
  }

  private checkBegan(): void {
    if (this.state === State.BEGAN) {
      if (this.shouldFail()) {
        this.fail();
      } else if (this.shouldActivate()) {
        this.activate();
      }
    }
  }

  public activate(force = false): void {
    if (this.state !== State.ACTIVE) {
      this.resetProgress();
    }

    super.activate(force);
  }

  protected onCancel(): void {
    this.clearActivationTimeout();
  }

  protected onReset(): void {
    this.clearActivationTimeout();
  }

  protected resetProgress(): void {
    if (this.state === State.ACTIVE) {
      return;
    }

    this.startX = this.lastX;
    this.startY = this.lastY;
  }
}
