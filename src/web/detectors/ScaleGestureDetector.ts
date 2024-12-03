import { DEFAULT_TOUCH_SLOP } from '../constants';
import { AdaptedEvent, EventTypes } from '../interfaces';

import PointerTracker from '../tools/PointerTracker';

export interface ScaleGestureListener {
  onScaleBegin: (detector: ScaleGestureDetector) => boolean;
  onScale: (detector: ScaleGestureDetector) => boolean;
  onScaleEnd: (detector: ScaleGestureDetector) => void;
}

export default class ScaleGestureDetector implements ScaleGestureListener {
  private _onScaleBegin: (detector: ScaleGestureDetector) => boolean;
  get onScaleBegin() {
    return this._onScaleBegin;
  }
  set onScaleBegin(value: (detector: ScaleGestureDetector) => boolean) {
    this._onScaleBegin = value;
  }

  private _onScale: (detector: ScaleGestureDetector) => boolean;
  get onScale() {
    return this._onScale;
  }
  set onScale(value: (detector: ScaleGestureDetector) => boolean) {
    this._onScale = value;
  }

  private _onScaleEnd: (detector: ScaleGestureDetector) => void;
  get onScaleEnd() {
    return this._onScaleEnd;
  }
  set onScaleEnd(value: (detector: ScaleGestureDetector) => void) {
    this._onScaleEnd = value;
  }

  private _focusX!: number;
  get focusX() {
    return this._focusX;
  }
  set focusX(value: number) {
    this._focusX = value;
  }

  private _focusY!: number;
  get focusY() {
    return this._focusY;
  }
  set focusY(value: number) {
    this._focusY = value;
  }

  private _currentSpan!: number;
  get currentSpan() {
    return this._currentSpan;
  }
  set currentSpan(value: number) {
    this._currentSpan = value;
  }

  private _prevSpan!: number;
  get prevSpan() {
    return this._prevSpan;
  }
  set prevSpan(value: number) {
    this._prevSpan = value;
  }

  private _initialSpan!: number;
  get initialSpan() {
    return this._initialSpan;
  }
  set initialSpan(value: number) {
    this._initialSpan = value;
  }

  private _currentTime!: number;
  get currentTime() {
    return this._currentTime;
  }
  set currentTime(value: number) {
    this._currentTime = value;
  }

  private _prevTime!: number;
  get prevTime() {
    return this._prevTime;
  }
  set prevTime(value: number) {
    this._prevTime = value;
  }

  private _inProgress = false;
  get inProgress() {
    return this._inProgress;
  }
  set inProgress(value: boolean) {
    this._inProgress = value;
  }

  private _spanSlop: number;
  get spanSlop() {
    return this._spanSlop;
  }
  set spanSlop(value: number) {
    this._spanSlop = value;
  }

  private _minSpan: number;
  get minSpan() {
    return this._minSpan;
  }
  set minSpan(value: number) {
    this._minSpan = value;
  }

  public constructor(callbacks: ScaleGestureListener) {
    this._onScaleBegin = callbacks.onScaleBegin;
    this._onScale = callbacks.onScale;
    this._onScaleEnd = callbacks.onScaleEnd;

    this._spanSlop = DEFAULT_TOUCH_SLOP * 2;
    this._minSpan = 0;
  }

  public onTouchEvent(event: AdaptedEvent, tracker: PointerTracker): boolean {
    this.currentTime = event.time;

    const action: EventTypes = event.eventType;
    const numOfPointers = tracker.getTrackedPointersCount();

    const streamComplete: boolean =
      action === EventTypes.UP ||
      action === EventTypes.ADDITIONAL_POINTER_UP ||
      action === EventTypes.CANCEL;

    if (action === EventTypes.DOWN || streamComplete) {
      if (this.inProgress) {
        this.onScaleEnd(this);
        this.inProgress = false;
        this.initialSpan = 0;
      }

      if (streamComplete) {
        return true;
      }
    }

    const configChanged: boolean =
      action === EventTypes.DOWN ||
      action === EventTypes.ADDITIONAL_POINTER_UP ||
      action === EventTypes.ADDITIONAL_POINTER_DOWN;

    const pointerUp = action === EventTypes.ADDITIONAL_POINTER_UP;

    const ignoredPointer: number | undefined = pointerUp
      ? event.pointerId
      : undefined;

    // Determine focal point

    const div: number = pointerUp ? numOfPointers - 1 : numOfPointers;

    const coordsSum = tracker.getAbsoluteCoordsSum();

    const focusX = coordsSum.x / div;
    const focusY = coordsSum.y / div;

    // Determine average deviation from focal point

    let devSumX = 0;
    let devSumY = 0;

    tracker.getData().forEach((value, key) => {
      if (key === ignoredPointer) {
        return;
      }

      devSumX += Math.abs(value.abosoluteCoords.x - focusX);
      devSumY += Math.abs(value.abosoluteCoords.y - focusY);
    });

    const devX: number = devSumX / div;
    const devY: number = devSumY / div;

    const spanX: number = devX * 2;
    const spanY: number = devY * 2;

    const span = Math.hypot(spanX, spanY);

    // Begin/end events
    const wasInProgress: boolean = this.inProgress;
    this.focusX = focusX;
    this.focusY = focusY;

    if (this.inProgress && (span < this.minSpan || configChanged)) {
      this.onScaleEnd(this);
      this.inProgress = false;
      this.initialSpan = span;
    }

    if (configChanged) {
      this.initialSpan = this.prevSpan = this.currentSpan = span;
    }

    if (
      !this.inProgress &&
      span >= this.minSpan &&
      (wasInProgress || Math.abs(span - this.initialSpan) > this.spanSlop)
    ) {
      this.prevSpan = this.currentSpan = span;
      this.prevTime = this.currentTime;
      this.inProgress = this.onScaleBegin(this);
    }

    // Handle motion
    if (action !== EventTypes.MOVE) {
      return true;
    }

    this.currentSpan = span;

    if (this.inProgress && !this.onScale(this)) {
      return true;
    }

    this.prevSpan = this.currentSpan;
    this.prevTime = this.currentTime;

    return true;
  }

  public getCurrentSpan(): number {
    return this.currentSpan;
  }

  public getFocusX(): number {
    return this.focusX;
  }

  public getFocusY(): number {
    return this.focusY;
  }

  public getTimeDelta(): number {
    return this.currentTime - this.prevTime;
  }

  public getScaleFactor(numOfPointers: number): number {
    if (numOfPointers < 2) {
      return 1;
    }

    return this.prevSpan > 0 ? this.currentSpan / this.prevSpan : 1;
  }
}
