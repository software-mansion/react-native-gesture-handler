import { DEFAULT_TOUCH_SLOP } from '../constants';
import { EventTypes, GHEvent } from '../tools/EventManager';
import Tracker from '../tools/Tracker';

export interface ScaleGestureListener {
  onScaleBegin: (detector: ScaleGestureDetector) => boolean;
  onScale: (detector: ScaleGestureDetector, event: GHEvent) => boolean;
  onScaleEnd: (detector: ScaleGestureDetector) => void;
}

const SCALE_FACTOR = 0.5;
const ANCHORED_SCALE_MODE_NONE = 0;
// const ANCHORED_SCALE_MODE_DOUBLE_TAP = 1;
const ANCHORED_SCALE_MODE_STYLUS = 2;

export default class ScaleGestureDetector implements ScaleGestureListener {
  public onScaleBegin: (detector: ScaleGestureDetector) => boolean;
  public onScale: (detector: ScaleGestureDetector, event: GHEvent) => boolean;
  public onScaleEnd: (detector: ScaleGestureDetector) => void;

  private focusX!: number;
  private focusY!: number;

  // private quickScaleEnabled: boolean;
  // private stylusScaleEnabled: boolean;

  private currentSpan!: number;
  private prevSpan!: number;
  private initialSpan!: number;
  // private currentSpanX!: number;
  // private currentSpanY!: number;
  // private prevSpanX: number;
  // private prevSpanY: number;

  private currentTime!: number;
  private prevTime!: number;

  private inProgress = false;

  private spanSlop: number;
  private minSpan: number;

  private anchoredScaleStartX!: number;
  private anchoredScaleStartY!: number;
  private anchoredScaleMode = ANCHORED_SCALE_MODE_NONE;

  private eventBeforeOrAboveStartingGestureEvent!: boolean;

  public constructor(callbacks: ScaleGestureListener) {
    this.onScaleBegin = callbacks.onScaleBegin;
    this.onScale = callbacks.onScale;
    this.onScaleEnd = callbacks.onScaleEnd;

    this.spanSlop = DEFAULT_TOUCH_SLOP * 2;
    this.minSpan = 0;
  }

  public onTouchEvent(event: GHEvent, tracker: Tracker): boolean {
    this.currentTime = event.time;

    const action: EventTypes = event.eventType;
    const numOfPointers = tracker.getTrackedPointersNumber();

    const isStylusButtonDown = false;

    const anchoredScaleCancelled: boolean =
      this.anchoredScaleMode === ANCHORED_SCALE_MODE_STYLUS &&
      !isStylusButtonDown;

    const streamComplete: boolean =
      action === EventTypes.UP ||
      action === EventTypes.POINTER_UP ||
      action === EventTypes.CANCEL ||
      anchoredScaleCancelled;

    if (action === EventTypes.DOWN || streamComplete) {
      if (this.inProgress) {
        this.onScaleEnd(this);
        this.inProgress = false;
        this.initialSpan = 0;
        this.anchoredScaleMode = ANCHORED_SCALE_MODE_NONE;
      } else if (this.inAnchoredScaleMode() && streamComplete) {
        this.inProgress = false;
        this.initialSpan = 0;
        this.anchoredScaleMode = ANCHORED_SCALE_MODE_NONE;
      }
      if (streamComplete) return true;
    }

    const configChanged: boolean =
      action === EventTypes.DOWN ||
      action === EventTypes.POINTER_UP ||
      action === EventTypes.POINTER_DOWN ||
      anchoredScaleCancelled;

    const pointerUp = action === EventTypes.POINTER_UP;

    const ignoredPointer: number | undefined = pointerUp
      ? event.pointerId
      : undefined;

    //Determine focal point
    let sumX = 0;
    let sumY = 0;

    const div: number = pointerUp ? numOfPointers - 1 : numOfPointers;

    let focusX: number;
    let focusY: number;

    if (this.inAnchoredScaleMode()) {
      focusX = this.anchoredScaleStartX;
      focusY = this.anchoredScaleStartY;

      if (event.y < focusY) this.eventBeforeOrAboveStartingGestureEvent = true;
      else this.eventBeforeOrAboveStartingGestureEvent = false;
    } else {
      sumX = tracker.getSumX(ignoredPointer);
      sumY = tracker.getSumY(ignoredPointer);

      focusX = sumX / div;
      focusY = sumY / div;
    }

    //Determine average deviation from focal point

    let devSumX = 0;
    let devSumY = 0;

    tracker.getData().forEach((value, key) => {
      if (key === ignoredPointer) return;

      devSumX += Math.abs(value.lastX - focusX);
      devSumY += Math.abs(value.lastY - focusY);
    });

    const devX: number = devSumX / div;
    const devY: number = devSumY / div;

    const spanX: number = devX * 2;
    const spanY: number = devY * 2;
    let span: number;

    if (this.inAnchoredScaleMode()) span = spanY;
    else span = Math.hypot(spanX, spanY);

    //Begin/end events
    const wasInProgress: boolean = this.inProgress;
    this.focusX = focusX;
    this.focusY = focusY;

    if (
      !this.inAnchoredScaleMode() &&
      this.inProgress &&
      (span < this.minSpan || configChanged)
    ) {
      this.onScaleEnd(this);
      this.inProgress = false;
      this.initialSpan = span;
    }

    if (configChanged) {
      // this.prevSpanX = this.currentSpanX = spanX;
      // this.prevSpanY = this.currentSpanY = spanY;
      this.initialSpan = this.prevSpan = this.currentSpan = span;
    }

    const minSpan: number = this.inAnchoredScaleMode()
      ? this.spanSlop
      : this.minSpan;

    if (
      !this.inProgress &&
      span >= minSpan &&
      (wasInProgress || Math.abs(span - this.initialSpan) > this.spanSlop)
    ) {
      // this.prevSpanX = this.currentSpanX = spanX;
      // this.prevSpanY = this.currentSpanY = spanY;
      this.prevSpan = this.currentSpan = span;
      this.prevTime = this.currentTime;
      this.inProgress = this.onScaleBegin(this);
    }

    //Handle motion
    if (action !== EventTypes.MOVE) return true;

    // this.currentSpanX = spanX;
    // this.currentSpanY = spanY;
    this.currentSpan = span;

    let updatePrev = true;

    if (this.inProgress) updatePrev = this.onScale(this, event);

    if (!updatePrev) return true;

    // this.prevSpanX = this.currentSpanX;
    // this.prevSpanY = this.currentSpanY;
    this.prevSpan = this.currentSpan;
    this.prevTime = this.currentTime;

    return true;
  }

  private inAnchoredScaleMode(): boolean {
    return this.anchoredScaleMode !== ANCHORED_SCALE_MODE_NONE;
  }

  public setQuickScaleEnabled(_scales: boolean): void {
    // this.quickScaleEnabled = scales;
  }

  public setStylusScaleEnabled(_scales: boolean): void {
    // this.stylusScaleEnabled = scales;
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
    if (numOfPointers < 2) return 1;

    if (!this.inAnchoredScaleMode()) {
      return this.prevSpan > 0 ? this.currentSpan / this.prevSpan : 1;
    }
    const scaleUp: boolean =
      (this.eventBeforeOrAboveStartingGestureEvent &&
        this.currentSpan < this.prevSpan) ||
      (!this.eventBeforeOrAboveStartingGestureEvent &&
        this.currentSpan > this.prevSpan);

    const spanDiff =
      Math.abs(1 - this.currentSpan / this.prevSpan) * SCALE_FACTOR;

    return this.prevSpan <= this.currentSpan
      ? 1
      : scaleUp
      ? 1 + spanDiff
      : 1 - spanDiff;
  }
}
