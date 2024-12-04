import { State } from '../../State';
import { AdaptedEvent, Config, EventTypes } from '../interfaces';

import GestureHandler from './GestureHandler';

const DEFAULT_MAX_DURATION_MS = 500;
const DEFAULT_MAX_DELAY_MS = 500;
const DEFAULT_NUMBER_OF_TAPS = 1;
const DEFAULT_MIN_NUMBER_OF_POINTERS = 1;

export default class TapGestureHandler extends GestureHandler {
  private _maxDeltaX = Number.MIN_SAFE_INTEGER;
  private _maxDeltaY = Number.MIN_SAFE_INTEGER;
  private _maxDistSq = Number.MIN_SAFE_INTEGER;
  private _maxDurationMs = DEFAULT_MAX_DURATION_MS;
  private _maxDelayMs = DEFAULT_MAX_DELAY_MS;
  private _numberOfTaps = DEFAULT_NUMBER_OF_TAPS;
  private _minNumberOfPointers = DEFAULT_MIN_NUMBER_OF_POINTERS;
  private _currentMaxNumberOfPointers = 1;
  private _startX = 0;
  private _startY = 0;
  private _offsetX = 0;
  private _offsetY = 0;
  private _lastX = 0;
  private _lastY = 0;
  private _waitTimeout: number | undefined;
  private _delayTimeout: number | undefined;
  private _tapsSoFar = 0;

  public init(ref: number, propsRef: React.RefObject<unknown>): void {
    super.init(ref, propsRef);
  }

  public updateGestureConfig({ enabled = true, ...props }: Config): void {
    super.updateGestureConfig({ enabled: enabled, ...props });

    if (this.config.numberOfTaps !== undefined) {
      this.numberOfTaps = this.config.numberOfTaps;
    }

    if (this.config.maxDurationMs !== undefined) {
      this.maxDurationMs = this.config.maxDurationMs;
    }

    if (this.config.maxDelayMs !== undefined) {
      this.maxDelayMs = this.config.maxDelayMs;
    }

    if (this.config.maxDeltaX !== undefined) {
      this.maxDeltaX = this.config.maxDeltaX;
    }

    if (this.config.maxDeltaY !== undefined) {
      this.maxDeltaY = this.config.maxDeltaY;
    }

    if (this.config.maxDist !== undefined) {
      this.maxDistSq = this.config.maxDist * this.config.maxDist;
    }

    if (this.config.minPointers !== undefined) {
      this.minNumberOfPointers = this.config.minPointers;
    }
  }

  protected resetConfig(): void {
    super.resetConfig();

    this.maxDeltaX = Number.MIN_SAFE_INTEGER;
    this.maxDeltaY = Number.MIN_SAFE_INTEGER;
    this.maxDistSq = Number.MIN_SAFE_INTEGER;
    this.maxDurationMs = DEFAULT_MAX_DURATION_MS;
    this.maxDelayMs = DEFAULT_MAX_DELAY_MS;
    this.numberOfTaps = DEFAULT_NUMBER_OF_TAPS;
    this.minNumberOfPointers = DEFAULT_MIN_NUMBER_OF_POINTERS;
  }

  private clearTimeouts(): void {
    clearTimeout(this.waitTimeout);
    clearTimeout(this.delayTimeout);
  }

  private startTap(): void {
    this.clearTimeouts();

    this.waitTimeout = setTimeout(() => this.fail(), this.maxDurationMs);
  }

  private endTap(): void {
    this.clearTimeouts();

    if (
      ++this.tapsSoFar === this.numberOfTaps &&
      this.currentMaxNumberOfPointers >= this.minNumberOfPointers
    ) {
      this.activate();
    } else {
      this.delayTimeout = setTimeout(() => this.fail(), this.maxDelayMs);
    }
  }

  // Handling Events
  protected onPointerDown(event: AdaptedEvent): void {
    if (!this.isButtonInConfig(event.button)) {
      return;
    }

    this.pointerTracker.addToTracker(event);
    super.onPointerDown(event);

    this.trySettingPosition(event);

    this.startX = event.x;
    this.startY = event.y;

    this.lastX = event.x;
    this.lastY = event.y;

    this.updateState(event);

    this.tryToSendTouchEvent(event);
  }

  protected onPointerAdd(event: AdaptedEvent): void {
    super.onPointerAdd(event);
    this.pointerTracker.addToTracker(event);
    this.trySettingPosition(event);

    this.offsetX += this.lastX - this.startX;
    this.offsetY += this.lastY - this.startY;

    const lastCoords = this.pointerTracker.getAbsoluteCoordsAverage();
    this.lastX = lastCoords.x;
    this.lastY = lastCoords.y;

    this.startX = lastCoords.x;
    this.startY = lastCoords.y;

    this.updateState(event);
  }

  protected onPointerUp(event: AdaptedEvent): void {
    super.onPointerUp(event);

    const lastCoords = this.pointerTracker.getAbsoluteCoordsAverage();
    this.lastX = lastCoords.x;
    this.lastY = lastCoords.y;

    this.pointerTracker.removeFromTracker(event.pointerId);

    this.updateState(event);
  }

  protected onPointerRemove(event: AdaptedEvent): void {
    super.onPointerRemove(event);
    this.pointerTracker.removeFromTracker(event.pointerId);

    this.offsetX += this.lastX - this.startX;
    this.offsetY += this.lastY = this.startY;

    const lastCoords = this.pointerTracker.getAbsoluteCoordsAverage();
    this.lastX = lastCoords.x;
    this.lastY = lastCoords.y;

    this.startX = this.lastX;
    this.startY = this.lastY;

    this.updateState(event);
  }

  protected onPointerMove(event: AdaptedEvent): void {
    this.trySettingPosition(event);
    this.pointerTracker.track(event);

    const lastCoords = this.pointerTracker.getAbsoluteCoordsAverage();
    this.lastX = lastCoords.x;
    this.lastY = lastCoords.y;

    this.updateState(event);

    super.onPointerMove(event);
  }

  protected onPointerOutOfBounds(event: AdaptedEvent): void {
    this.trySettingPosition(event);
    this.pointerTracker.track(event);

    const lastCoords = this.pointerTracker.getAbsoluteCoordsAverage();
    this.lastX = lastCoords.x;
    this.lastY = lastCoords.y;

    this.updateState(event);

    super.onPointerOutOfBounds(event);
  }

  private updateState(event: AdaptedEvent): void {
    if (
      this.currentMaxNumberOfPointers <
      this.pointerTracker.getTrackedPointersCount()
    ) {
      this.currentMaxNumberOfPointers =
        this.pointerTracker.getTrackedPointersCount();
    }

    if (this.shouldFail()) {
      this.fail();
      return;
    }

    switch (this.state) {
      case State.UNDETERMINED:
        if (event.eventType === EventTypes.DOWN) {
          this.begin();
        }
        this.startTap();
        break;
      case State.BEGAN:
        if (event.eventType === EventTypes.UP) {
          this.endTap();
        }
        if (event.eventType === EventTypes.DOWN) {
          this.startTap();
        }
        break;
      default:
        break;
    }
  }

  private trySettingPosition(event: AdaptedEvent): void {
    if (this.state !== State.UNDETERMINED) {
      return;
    }

    this.offsetX = 0;
    this.offsetY = 0;
    this.startX = event.x;
    this.startY = event.y;
  }

  private shouldFail(): boolean {
    const dx = this.lastX - this.startX + this.offsetX;

    if (
      this.maxDeltaX !== Number.MIN_SAFE_INTEGER &&
      Math.abs(dx) > this.maxDeltaX
    ) {
      return true;
    }

    const dy = this.lastY - this.startY + this.offsetY;
    if (
      this.maxDeltaY !== Number.MIN_SAFE_INTEGER &&
      Math.abs(dy) > this.maxDeltaY
    ) {
      return true;
    }

    const distSq = dy * dy + dx * dx;

    return (
      this.maxDistSq !== Number.MIN_SAFE_INTEGER && distSq > this.maxDistSq
    );
  }

  public activate(): void {
    super.activate();

    this.end();
  }

  protected onCancel(): void {
    this.resetProgress();
    this.clearTimeouts();
  }

  protected resetProgress(): void {
    this.clearTimeouts();
    this.tapsSoFar = 0;
    this.currentMaxNumberOfPointers = 0;
  }

  get maxDeltaX() {
    return this._maxDeltaX;
  }
  set maxDeltaX(value: number) {
    this._maxDeltaX = value;
  }

  get maxDeltaY() {
    return this._maxDeltaY;
  }
  set maxDeltaY(value: number) {
    this._maxDeltaY = value;
  }

  get maxDistSq() {
    return this._maxDistSq;
  }
  set maxDistSq(value: number) {
    this._maxDistSq = value;
  }

  get maxDurationMs() {
    return this._maxDurationMs;
  }
  set maxDurationMs(value: number) {
    this._maxDurationMs = value;
  }

  get maxDelayMs() {
    return this._maxDelayMs;
  }
  set maxDelayMs(value: number) {
    this._maxDelayMs = value;
  }

  get numberOfTaps() {
    return this._numberOfTaps;
  }
  set numberOfTaps(value: number) {
    this._numberOfTaps = value;
  }

  get minNumberOfPointers() {
    return this._minNumberOfPointers;
  }
  set minNumberOfPointers(value: number) {
    this._minNumberOfPointers = value;
  }

  get currentMaxNumberOfPointers() {
    return this._currentMaxNumberOfPointers;
  }
  set currentMaxNumberOfPointers(value: number) {
    this._currentMaxNumberOfPointers = value;
  }

  get startX() {
    return this._startX;
  }
  set startX(value: number) {
    this._startX = value;
  }

  get startY() {
    return this._startY;
  }
  set startY(value: number) {
    this._startY = value;
  }

  get offsetX() {
    return this._offsetX;
  }
  set offsetX(value: number) {
    this._offsetX = value;
  }

  get offsetY() {
    return this._offsetY;
  }
  set offsetY(value: number) {
    this._offsetY = value;
  }

  get lastX() {
    return this._lastX;
  }
  set lastX(value: number) {
    this._lastX = value;
  }

  get lastY() {
    return this._lastY;
  }
  set lastY(value: number) {
    this._lastY = value;
  }

  get waitTimeout() {
    return this._waitTimeout;
  }
  set waitTimeout(value: number | undefined) {
    this._waitTimeout = value;
  }

  get delayTimeout() {
    return this._delayTimeout;
  }
  set delayTimeout(value: number | undefined) {
    this._delayTimeout = value;
  }

  get tapsSoFar() {
    return this._tapsSoFar;
  }
  set tapsSoFar(value: number) {
    this._tapsSoFar = value;
  }
}
