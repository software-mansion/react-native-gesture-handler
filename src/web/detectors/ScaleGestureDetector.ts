import { DEFAULT_TOUCH_SLOP } from '../constants';
import { AdaptedEvent, EventTypes } from '../interfaces';

import PointerTracker from '../tools/PointerTracker';

export interface ScaleGestureListener {
  onScaleBegin: (detector: ScaleGestureDetector) => boolean;
  onScale: (detector: ScaleGestureDetector) => boolean;
  onScaleEnd: (detector: ScaleGestureDetector) => void;
}

export default class ScaleGestureDetector implements ScaleGestureListener {
  public onScaleBegin: (detector: ScaleGestureDetector) => boolean;
  public onScale: (detector: ScaleGestureDetector) => boolean;
  public onScaleEnd: (detector: ScaleGestureDetector) => void;

  private _focusX!: number;
  private _focusY!: number;

  private _currentSpan!: number;
  private prevSpan!: number;
  private initialSpan!: number;

  private currentTime!: number;
  private prevTime!: number;

  private inProgress = false;

  private spanSlop: number;
  private minSpan: number;

  constructor(callbacks: ScaleGestureListener) {
    this.onScaleBegin = callbacks.onScaleBegin;
    this.onScale = callbacks.onScale;
    this.onScaleEnd = callbacks.onScaleEnd;

    this.spanSlop = DEFAULT_TOUCH_SLOP * 2;
    this.minSpan = 0;
  }

  public onTouchEvent(event: AdaptedEvent, tracker: PointerTracker): boolean {
    this.currentTime = event.time;

    const action: EventTypes = event.eventType;
    const numOfPointers = tracker.trackedPointersCount;

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

    tracker.trackedPointers.forEach((value, key) => {
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
    this._focusX = focusX;
    this._focusY = focusY;

    if (this.inProgress && (span < this.minSpan || configChanged)) {
      this.onScaleEnd(this);
      this.inProgress = false;
      this.initialSpan = span;
    }

    if (configChanged) {
      this.initialSpan = this.prevSpan = this._currentSpan = span;
    }

    if (
      !this.inProgress &&
      span >= this.minSpan &&
      (wasInProgress || Math.abs(span - this.initialSpan) > this.spanSlop)
    ) {
      this.prevSpan = this._currentSpan = span;
      this.prevTime = this.currentTime;
      this.inProgress = this.onScaleBegin(this);
    }

    // Handle motion
    if (action !== EventTypes.MOVE) {
      return true;
    }

    this._currentSpan = span;

    if (this.inProgress && !this.onScale(this)) {
      return true;
    }

    this.prevSpan = this.currentSpan;
    this.prevTime = this.currentTime;

    return true;
  }

  public calculateScaleFactor(numOfPointers: number): number {
    if (numOfPointers < 2) {
      return 1;
    }

    return this.prevSpan > 0 ? this.currentSpan / this.prevSpan : 1;
  }

  public get currentSpan() {
    return this._currentSpan;
  }

  public get focusX() {
    return this._focusX;
  }

  public get focusY() {
    return this._focusY;
  }

  public get timeDelta() {
    return this.currentTime - this.prevTime;
  }
}
