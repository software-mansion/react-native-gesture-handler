import { PixelRatio } from 'react-native';
import { State } from '../State';
import { DEFAULT_TOUCH_SLOP } from './constants';
import { EventTypes, GHEvent } from './EventManager';
import GestureHandler from './GestureHandler';

// interface PanConfig extends Config {
//   minDist?: number;
//   maxDist?: number;

//   minPointers?: number;
//   maxPointers?: number;

//   minVelocity?: number;

//   activeOffsetXStart?: number;
//   activeOffsetXEnd?: number;
//   failOffsetXStart?: number;
//   failOffsetXEnd?: number;
//   activeOffsetYStart?: number;
//   activeOffsetYEnd?: number;
//   failOffsetYStart?: number;
//   failOffsetYEnd?: number;
// }
class PanGestureHandler extends GestureHandler {
  readonly DEFAULT_MIN_POINTERS = 1;
  readonly DEFAULT_MAX_POINTERS = 1;

  //
  public velocityX = 0;
  public velocityY = 0;

  private defaultMinDistSq: number = DEFAULT_TOUCH_SLOP * DEFAULT_TOUCH_SLOP;

  private minDistSq = this.defaultMinDistSq;

  private activeOffsetXStart = Number.MAX_SAFE_INTEGER;
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

  private lastCachedX = 0;
  private lastCachedTime = 0;

  private activateAfterLongPress = 0;

  //
  public init(ref: number, propsRef: any): void {
    super.init(ref, propsRef);
  }
  //

  get name(): string {
    return 'pan';
  }

  public updateGestureConfig({ ...props }): void {
    super.updateGestureConfig({ enabled: true, ...props });

    for (const key in this.config) {
      if (
        !isNaN(this.config[key]) &&
        this.config[key] !== undefined &&
        this.config[key] !== null
      ) {
        this.hasCustomActivationCriteria = true;
      }
    }

    this.enabled = this.config.enabled as boolean;

    if (this.config.minDist || this.config.minDist === 0) {
      this.minDistSq = this.config.minDist * this.config.minDist;
    }

    if (this.config.minPointers || this.config.minPointers === 0) {
      this.minPointers = this.config.minPointers as number;
    }

    if (this.config.maxPointers || this.config.maxPointers === 0) {
      this.maxPointers = this.config.maxPointers as number;
    }

    if (this.config.minVelocity) {
      //
    }

    if (this.config.shouldCancelWhenOutside) {
      this.setShouldCancelWhenOutside(false);
    }

    if (
      this.config.activeOffsetXStart ||
      this.config.activeOffsetXStart === 0
    ) {
      this.activeOffsetXStart = this.config.activeOffsetXStart as number;
    }

    if (this.config.activeOffsetXEnd || this.config.activeOffsetXEnd === 0) {
      this.activeOffsetXEnd = this.config.activeOffsetXEnd as number;
    }

    if (this.config.failOffsetXStart || this.config.failOffsetXStart === 0) {
      this.failOffsetXStart = this.config.failOffsetXStart as number;
    }

    if (this.config.failOffsetXEnd || this.config.failOffsetXEnd === 0) {
      this.failOffsetXEnd = this.config.failOffsetXEnd as number;
    }

    if (
      this.config.activeOffsetYStart ||
      this.config.activeOffsetYStart === 0
    ) {
      this.activeOffsetYStart = this.config.activeOffsetYStart as number;
    }

    if (this.config.activeOffsetYEnd || this.config.activeOffsetYEnd === 0) {
      this.activeOffsetYEnd = this.config.activeOffsetYEnd as number;
    }

    if (this.config.failOffsetYStart || this.config.failOffsetYStart === 0) {
      this.failOffsetYStart = this.config.failOffsetYStart as number;
    }

    if (this.config.failOffsetYEnd || this.config.failOffsetYEnd === 0) {
      this.activeOffsetYEnd = this.config.activeOffsetYEnd as number;
    }
  }

  protected transformNativeEvent(event: GHEvent): any {
    if (!this.view) return;

    const rect = this.view.getBoundingClientRect();
    const ratio = PixelRatio.get();

    return {
      translationX: this.getTranslationX(),
      translationY: this.getTranslationY(),
      absoluteX: event.x,
      absoluteY: event.y,
      velocityX: this.velocityX * ratio * 10,
      velocityY: this.velocityY * ratio * 10,
      x: event.x - rect.left,
      y: event.y - rect.top,
    };
  }

  protected resetConfig(): void {
    super.resetConfig();

    this.activeOffsetXStart = Number.MAX_SAFE_INTEGER;
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

    this.minDistSq = this.defaultMinDistSq;

    this.minPointers = this.DEFAULT_MIN_POINTERS;
    this.maxPointers = this.DEFAULT_MAX_POINTERS;

    this.activateAfterLongPress = 0;
  }

  private getTranslationX(): number {
    return this.lastX - this.startX + this.offsetX;
  }
  private getTranslationY(): number {
    return this.lastY - this.startY + this.offsetY;
  }

  //EventsHandling
  protected onDownAction(event: GHEvent): void {
    super.onDownAction(event);
    this.tracker.addToTracker(event);

    if (this.tracker.getTrackedPointersNumber() > 1) {
      event.eventType = EventTypes.POINTER_DOWN;
      this.onPointerAdd(event);
      return;
    }

    this.lastX = this.tracker.getLastAvgX();
    this.lastY = this.tracker.getLastAvgY();

    this.checkUndetermined(event);
    this.checkBegan(event);
  }
  protected onPointerAdd(event: GHEvent): void {
    this.offsetX += this.lastX - this.startX;
    this.offsetY += this.lastY - this.startY;

    this.lastX = this.tracker.getLastAvgX();
    this.lastY = this.tracker.getLastAvgY();

    this.startX = this.lastX;
    this.startY = this.lastY;

    // this.checkUndetermined(event);

    if (this.tracker.getTrackedPointersNumber() > this.maxPointers) {
      if (this.getState() === State.ACTIVE) this.cancel(event);
      else this.fail(event);
    } else this.checkBegan(event);
  }

  protected onUpAction(event: GHEvent): void {
    super.onUpAction(event);

    if (this.tracker.getTrackedPointersNumber() > 1) {
      this.tracker.removeFromTracker(event.pointerId);

      event.eventType = EventTypes.POINTER_UP;
      this.onPointerRemove(event);
      return;
    }

    if (this.getState() === State.ACTIVE) {
      this.lastX = this.tracker.getLastAvgX();
      this.lastY = this.tracker.getLastAvgY();
    }

    this.tracker.removeFromTracker(event.pointerId);

    if (this.getState() === State.ACTIVE) {
      this.end(event);
    } else {
      this.resetProgress();
      this.fail(event);
    }
  }
  protected onPointerRemove(event: GHEvent): void {
    this.offsetX += this.lastX - this.startX;
    this.offsetY += this.lastY - this.startY;

    this.lastX = this.tracker.getLastAvgX();
    this.lastY = this.tracker.getLastAvgY();

    this.startX = this.lastX;
    this.startY = this.lastY;

    if (
      this.getState() === State.ACTIVE &&
      this.tracker.getTrackedPointersNumber() < this.minPointers
    ) {
      this.resetProgress();
      this.fail(event);
      // this.end(event);
    } else this.checkBegan(event);
  }

  protected onMoveAction(event: GHEvent): void {
    this.lastCachedX = this.tracker.getLastAvgX();
    this.tracker.track(event);

    this.lastX = this.tracker.getLastAvgX();
    this.lastY = this.tracker.getLastAvgY();

    this.checkUndetermined(event);
    this.checkBegan(event);

    super.onMoveAction(event);
  }
  protected onOutAction(event: GHEvent): void {
    super.onOutAction(event);
  }
  protected onEnterAction(event: GHEvent): void {
    super.onEnterAction(event);
  }
  protected onCancelAction(event: GHEvent): void {
    super.onCancelAction(event);

    this.reset();
  }
  protected onOutOfBoundsAction(event: GHEvent): void {
    if (this.getShouldCancelWhenOutside()) return;

    this.tracker.track(event);

    this.lastX = this.tracker.getLastAvgX();
    this.lastY = this.tracker.getLastAvgY();

    this.checkBegan(event);

    if (this.getState() === State.ACTIVE) super.onOutOfBoundsAction(event);
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

    if (this.activateAfterLongPress > 0 && distanceSq > this.defaultMinDistSq) {
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

  private checkUndetermined(event: GHEvent): void {
    if (
      this.getState() === State.UNDETERMINED &&
      this.tracker.getTrackedPointersNumber() >= this.minPointers
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

  private checkBegan(event: GHEvent): void {
    if (this.getState() === State.BEGAN) {
      if (this.shouldFail()) this.fail(event);
      else if (this.shouldActivate()) {
        this.activate(event);
      }
    }
  }

  protected activate(event: GHEvent, force = false): void {
    if (this.currentState !== State.ACTIVE) {
      this.resetProgress();
    }

    super.activate(event, force);
  }

  protected resetProgress(): void {
    if (this.getState() === State.ACTIVE) return;

    this.startX = this.lastX;
    this.startY = this.lastY;
  }

  protected onCancel(): void {
    //
  }
  protected onReset(): void {
    //
  }
}

export default PanGestureHandler;
