import { DEFAULT_TOUCH_SLOP } from '../constants';
import { AdaptedEvent, EventTypes } from '../interfaces';

import PointerTracker from '../tools/PointerTracker';

export interface ScaleGestureListener {
  onScaleBegin: (detector: ScaleGestureDetector) => boolean;
  onScale: (detector: ScaleGestureDetector) => boolean;
  onScaleEnd: (detector: ScaleGestureDetector) => void;
}

export default class ScaleGestureDetector implements ScaleGestureListener {
  private _focusX!: number;
  private _focusY!: number;
  private _currentSpan!: number;
  private _prevSpan!: number;
  private _initialSpan!: number;
  private _currentTime!: number;
  private _prevTime!: number;
  private _inProgress = false;
  private _spanSlop: number;
  private _minSpan: number;
  private _pointerTracker: PointerTracker;

  onScaleBegin: (detector: ScaleGestureDetector) => boolean;
  onScale: (detector: ScaleGestureDetector) => boolean;
  onScaleEnd: (detector: ScaleGestureDetector) => void;

  public constructor(
    callbacks: ScaleGestureListener,
    pointerTracker: PointerTracker
  ) {
    this.onScaleBegin = callbacks.onScaleBegin;
    this.onScale = callbacks.onScale;
    this.onScaleEnd = callbacks.onScaleEnd;

    this._spanSlop = DEFAULT_TOUCH_SLOP * 2;
    this._minSpan = 0;
    this._pointerTracker = pointerTracker;
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

  public get focusX() {
    return this._focusX;
  }
  public set focusX(value: number) {
    this._focusX = value;
  }

  public get focusY() {
    return this._focusY;
  }
  public set focusY(value: number) {
    this._focusY = value;
  }

  public get currentSpan() {
    return this._currentSpan;
  }
  public set currentSpan(value: number) {
    this._currentSpan = value;
  }

  public get prevSpan() {
    return this._prevSpan;
  }
  public set prevSpan(value: number) {
    this._prevSpan = value;
  }

  public get initialSpan() {
    return this._initialSpan;
  }
  public set initialSpan(value: number) {
    this._initialSpan = value;
  }

  public get currentTime() {
    return this._currentTime;
  }
  public set currentTime(value: number) {
    this._currentTime = value;
  }

  public get prevTime() {
    return this._prevTime;
  }
  public set prevTime(value: number) {
    this._prevTime = value;
  }

  public get inProgress() {
    return this._inProgress;
  }
  public set inProgress(value: boolean) {
    this._inProgress = value;
  }

  public get spanSlop() {
    return this._spanSlop;
  }
  public set spanSlop(value: number) {
    this._spanSlop = value;
  }

  public get minSpan() {
    return this._minSpan;
  }
  public set minSpan(value: number) {
    this._minSpan = value;
  }

  public get pointerTracker() {
    return this._pointerTracker;
  }
  public set pointerTracker(value: PointerTracker) {
    this._pointerTracker = value;
  }

  public get timeDelta(): number {
    return this.currentTime - this.prevTime;
  }

  public get scaleFactor() {
    if (this.pointerTracker.getTrackedPointersCount() < 2) {
      return 1;
    }

    return this.prevSpan > 0 ? this.currentSpan / this.prevSpan : 1;
  }
}
