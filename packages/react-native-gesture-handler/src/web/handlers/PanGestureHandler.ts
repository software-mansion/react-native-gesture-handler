import { State } from '../../State';
import { DEFAULT_TOUCH_SLOP } from '../constants';
import { AdaptedEvent, Config, StylusData, WheelDevice } from '../interfaces';

import GestureHandler from './GestureHandler';

const DEFAULT_MIN_POINTERS = 1;
const DEFAULT_MAX_POINTERS = 10;
const DEFAULT_MIN_DIST_SQ = DEFAULT_TOUCH_SLOP * DEFAULT_TOUCH_SLOP;

export default class PanGestureHandler extends GestureHandler {
  private readonly customActivationProperties: string[] = [
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

  public velocityX = 0;
  public velocityY = 0;

  private minDistSq = DEFAULT_MIN_DIST_SQ;

  private activeOffsetXStart = -Number.MAX_SAFE_INTEGER;
  private activeOffsetXEnd = Number.MIN_SAFE_INTEGER;
  private failOffsetXStart = Number.MIN_SAFE_INTEGER;
  private failOffsetXEnd = Number.MAX_SAFE_INTEGER;

  private activeOffsetYStart = Number.MAX_SAFE_INTEGER;
  private activeOffsetYEnd = Number.MIN_SAFE_INTEGER;
  private failOffsetYStart = Number.MIN_SAFE_INTEGER;
  private failOffsetYEnd = Number.MAX_SAFE_INTEGER;

  private minVelocityX = Number.MAX_SAFE_INTEGER;
  private minVelocityY = Number.MAX_SAFE_INTEGER;
  private minVelocitySq = Number.MAX_SAFE_INTEGER;

  private minPointers = DEFAULT_MIN_POINTERS;
  private maxPointers = DEFAULT_MAX_POINTERS;

  private startX = 0;
  private startY = 0;
  private offsetX = 0;
  private offsetY = 0;
  private lastX = 0;
  private lastY = 0;

  private stylusData: StylusData | undefined;

  private activateAfterLongPress = 0;
  private activationTimeout = 0;

  private enableTrackpadTwoFingerGesture = false;
  private endWheelTimeout = 0;
  private wheelDevice = WheelDevice.UNDETERMINED;

  public updateGestureConfig({ enabled = true, ...props }: Config): void {
    this.resetConfig();

    super.updateGestureConfig({ enabled: enabled, ...props });
    this.checkCustomActivationCriteria(this.customActivationProperties);

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

  private updateLastCoords() {
    const { x, y } = this.tracker.getAbsoluteCoordsAverage();

    this.lastX = x;
    this.lastY = y;
  }

  private updateVelocity(pointerId: number) {
    const { x, y } = this.tracker.getVelocity(pointerId);

    this.velocityX = x;
    this.velocityY = y;
  }

  // Events Handling
  protected onPointerDown(event: AdaptedEvent): void {
    if (!this.isButtonInConfig(event.button)) {
      return;
    }

    this.tracker.addToTracker(event);
    this.stylusData = event.stylusData;

    super.onPointerDown(event);

    this.updateLastCoords();

    this.startX = this.lastX;
    this.startY = this.lastY;

    this.tryBegin(event);
    this.checkBegan();

    this.tryToSendTouchEvent(event);
  }

  protected onPointerAdd(event: AdaptedEvent): void {
    this.tracker.addToTracker(event);
    super.onPointerAdd(event);
    this.tryBegin(event);

    this.offsetX += this.lastX - this.startX;
    this.offsetY += this.lastY - this.startY;

    this.updateLastCoords();

    this.startX = this.lastX;
    this.startY = this.lastY;

    if (this.tracker.trackedPointersCount > this.maxPointers) {
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
      const lastCoords = this.tracker.getAbsoluteCoordsAverage();
      this.lastX = lastCoords.x;
      this.lastY = lastCoords.y;
    }

    this.tracker.removeFromTracker(event.pointerId);

    if (this.tracker.trackedPointersCount === 0) {
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
    this.tracker.removeFromTracker(event.pointerId);

    this.offsetX += this.lastX - this.startX;
    this.offsetY += this.lastY - this.startY;

    this.updateLastCoords();

    this.startX = this.lastX;
    this.startY = this.lastY;

    if (
      !(
        this.state === State.ACTIVE &&
        this.tracker.trackedPointersCount < this.minPointers
      )
    ) {
      this.checkBegan();
    }
  }

  protected onPointerMove(event: AdaptedEvent): void {
    this.tracker.track(event);
    this.stylusData = event.stylusData;

    this.updateLastCoords();
    this.updateVelocity(event.pointerId);

    this.checkBegan();

    super.onPointerMove(event);
  }

  protected onPointerOutOfBounds(event: AdaptedEvent): void {
    if (this.shouldCancelWhenOutside) {
      return;
    }

    this.tracker.track(event);
    this.stylusData = event.stylusData;

    this.updateLastCoords();
    this.updateVelocity(event.pointerId);

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
        this.tracker.removeFromTracker(event.pointerId);
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

      this.tracker.addToTracker(event);

      this.updateLastCoords();

      this.startX = this.lastX;
      this.startY = this.lastY;

      this.begin();
      this.activate();
    }
    this.tracker.track(event);

    this.updateLastCoords();
    this.updateVelocity(event.pointerId);

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
      this.tracker.trackedPointersCount >= this.minPointers
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
      this.updateVelocity(event.pointerId);
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
