import { PixelRatio } from 'react-native';
import { State } from '../../State';
import { DEFAULT_TOUCH_SLOP } from '../constants';
import { AdaptedPointerEvent } from '../interfaces';

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

  private minPointers = 1;
  private maxPointers = 10;

  private startX = 0;
  private startY = 0;
  private offsetX = 0;
  private offsetY = 0;
  private lastX = 0;
  private lastY = 0;

  // TODO: Implement logic required for activateAfterLongPress
  private activateAfterLongPress = 0;

  public init(ref: number, propsRef: React.RefObject<unknown>): void {
    super.init(ref, propsRef);
  }

  public updateGestureConfig({ enabled = true, ...props }): void {
    this.resetConfig();

    super.updateGestureConfig({ enabled: enabled, ...props });
    this.checkCustomActivationCriteria(this.customActivationProperties);

    this.enabled = enabled;

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

    if (this.config.shouldCancelWhenOutside) {
      this.setShouldCancelWhenOutside(false);
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

  protected transformNativeEvent(event: AdaptedPointerEvent) {
    if (!this.view) {
      return {};
    }

    const ratio = PixelRatio.get();

    return {
      translationX: this.getTranslationX(),
      translationY: this.getTranslationY(),
      absoluteX: event.x,
      absoluteY: event.y,
      velocityX: this.velocityX * ratio * 10,
      velocityY: this.velocityY * ratio * 10,
      x: event.offsetX,
      y: event.offsetY,
    };
  }

  private getTranslationX(): number {
    return this.lastX - this.startX + this.offsetX;
  }
  private getTranslationY(): number {
    return this.lastY - this.startY + this.offsetY;
  }

  //EventsHandling
  protected onPointerDown(event: AdaptedPointerEvent): void {
    super.onPointerDown(event);
    this.tracker.addToTracker(event);

    if (this.tracker.getTrackedPointersCount() > 1) {
      this.onPointerAdd(event);
      return;
    }

    this.lastX = this.tracker.getLastAvgX();
    this.lastY = this.tracker.getLastAvgY();

    this.tryBegin(event);
    this.checkBegan(event);
  }
  protected onPointerAdd(event: AdaptedPointerEvent): void {
    this.tryBegin(event);

    this.offsetX += this.lastX - this.startX;
    this.offsetY += this.lastY - this.startY;

    this.lastX = this.tracker.getLastAvgX();
    this.lastY = this.tracker.getLastAvgY();

    this.startX = this.lastX;
    this.startY = this.lastY;

    if (this.tracker.getTrackedPointersCount() > this.maxPointers) {
      if (this.currentState === State.ACTIVE) {
        this.cancel(event);
      } else {
        this.fail(event);
      }
    } else {
      this.checkBegan(event);
    }
  }

  protected onPointerUp(event: AdaptedPointerEvent): void {
    super.onPointerUp(event);

    if (this.tracker.getTrackedPointersCount() > 1) {
      this.tracker.removeFromTracker(event.pointerId);

      this.onPointerRemove(event);
      return;
    }

    if (this.currentState === State.ACTIVE) {
      this.lastX = this.tracker.getLastAvgX();
      this.lastY = this.tracker.getLastAvgY();
    }

    this.tracker.removeFromTracker(event.pointerId);

    if (this.currentState === State.ACTIVE) {
      this.end(event);
    } else {
      this.resetProgress();
      this.fail(event);
    }
  }
  protected onPointerRemove(event: AdaptedPointerEvent): void {
    this.offsetX += this.lastX - this.startX;
    this.offsetY += this.lastY - this.startY;

    this.lastX = this.tracker.getLastAvgX();
    this.lastY = this.tracker.getLastAvgY();

    this.startX = this.lastX;
    this.startY = this.lastY;

    if (
      !(
        this.currentState === State.ACTIVE &&
        this.tracker.getTrackedPointersCount() < this.minPointers
      )
    ) {
      this.checkBegan(event);
    }
  }

  protected onPointerMove(event: AdaptedPointerEvent): void {
    this.tracker.track(event);

    this.lastX = this.tracker.getLastAvgX();
    this.lastY = this.tracker.getLastAvgY();
    this.velocityX = this.tracker.getVelocityX(event.pointerId);
    this.velocityY = this.tracker.getVelocityY(event.pointerId);

    this.checkBegan(event);

    super.onPointerMove(event);
  }

  protected onPointerCancel(event: AdaptedPointerEvent): void {
    super.onPointerCancel(event);

    this.reset();
  }
  protected onPointerOutOfBounds(event: AdaptedPointerEvent): void {
    if (this.getShouldCancelWhenOutside()) {
      return;
    }

    this.tracker.track(event);

    this.lastX = this.tracker.getLastAvgX();
    this.lastY = this.tracker.getLastAvgY();
    this.velocityX = this.tracker.getVelocityX(event.pointerId);
    this.velocityY = this.tracker.getVelocityY(event.pointerId);

    this.checkBegan(event);

    if (this.currentState === State.ACTIVE) {
      super.onPointerOutOfBounds(event);
    }
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

  private tryBegin(event: AdaptedPointerEvent): void {
    if (
      this.currentState === State.UNDETERMINED &&
      this.tracker.getTrackedPointersCount() >= this.minPointers
    ) {
      this.resetProgress();
      this.offsetX = 0;
      this.offsetY = 0;
      this.velocityX = 0;
      this.velocityY = 0;

      this.begin(event);

      //Long press
    } else {
      this.velocityX = this.tracker.getVelocityX(event.pointerId);
      this.velocityY = this.tracker.getVelocityY(event.pointerId);
    }
  }

  private checkBegan(event: AdaptedPointerEvent): void {
    if (this.currentState === State.BEGAN) {
      if (this.shouldFail()) {
        this.fail(event);
      } else if (this.shouldActivate()) {
        this.activate(event);
      }
    }
  }

  protected activate(event: AdaptedPointerEvent, force = false): void {
    if (this.currentState !== State.ACTIVE) {
      this.resetProgress();
    }

    super.activate(event, force);
  }

  protected resetProgress(): void {
    if (this.currentState === State.ACTIVE) {
      return;
    }

    this.startX = this.lastX;
    this.startY = this.lastY;
  }
}
