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

  private focusX!: number;
  private focusY!: number;

  private currentSpan!: number;
  private prevSpan!: number;
  private initialSpan!: number;

  private currentTime!: number;
  private prevTime!: number;

  private inProgress = false;

  private spanSlop: number;
  private minSpan: number;

  public constructor(callbacks: ScaleGestureListener) {
    this.onScaleBegin = callbacks.onScaleBegin;
    this.onScale = callbacks.onScale;
    this.onScaleEnd = callbacks.onScaleEnd;

    this.spanSlop = DEFAULT_TOUCH_SLOP * 2;
    this.minSpan = 0;
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
