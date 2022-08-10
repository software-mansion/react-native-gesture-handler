import { State } from '../../State';
import { EventTypes, GHEvent } from '../tools/EventManager';
import GestureHandler from './GestureHandler';

const DEFAULT_MAX_DURATION_MS = 500;
const DEFAULT_MAX_DELAY_MS = 200;
const DEFAULT_NUMBER_OF_TAPS = 1;
const DEFAULT_MIN_NUMBER_OF_POINTERS = 1;

export default class TapGestureHandler extends GestureHandler {
  private maxDeltaX = Number.MIN_SAFE_INTEGER;
  private maxDeltaY = Number.MIN_SAFE_INTEGER;
  private maxDistSq = Number.MIN_SAFE_INTEGER;
  private maxDurationMs = DEFAULT_MAX_DURATION_MS;
  private maxDelayMs = DEFAULT_MAX_DELAY_MS;

  private numberOfTaps = DEFAULT_NUMBER_OF_TAPS;
  private minNumberOfPointers = DEFAULT_MIN_NUMBER_OF_POINTERS;
  private currentMaxNumberOfPointers = 1;

  private startX = 0;
  private startY = 0;
  private offsetX = 0;
  private offsetY = 0;
  private lastX = 0;
  private lastY = 0;

  private waitTimeout: number | undefined;
  private delayTimeout: number | undefined;

  private tapsSoFar = 0;

  public init(ref: number, propsRef: React.RefObject<unknown>): void {
    super.init(ref, propsRef);
    this.setShouldCancelWhenOutside(true);

    console.log();
  }

  get name(): string {
    return 'tap';
  }

  public updateGestureConfig({ ...props }): void {
    super.updateGestureConfig({ enabled: true, ...props });

    this.enabled = true;

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

    if (this.config.maxDistSq !== undefined) {
      this.maxDistSq = this.config.maxDistSq;
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

  private startTap(event: GHEvent): void {
    this.clearTimeouts();

    this.waitTimeout = setTimeout(() => this.fail(event), this.maxDurationMs);
  }

  private endTap(event: GHEvent): void {
    this.clearTimeouts();

    if (
      ++this.tapsSoFar === this.numberOfTaps &&
      this.currentMaxNumberOfPointers >= this.minNumberOfPointers
    ) {
      this.activate(event);
    } else {
      this.delayTimeout = setTimeout(() => this.fail(event), this.maxDelayMs);
    }
  }

  //Handling Events
  protected onDownAction(event: GHEvent): void {
    super.onDownAction(event);
    this.tracker.addToTracker(event);

    this.checkUndetermined(event);

    if (this.tracker.getTrackedPointersNumber() > 1) {
      event.eventType = EventTypes.POINTER_DOWN;
      this.onPointerAdd(event);
    } else {
      this.lastX = this.tracker.getLastAvgX();
      this.lastY = this.tracker.getLastAvgY();
    }
    this.commonAction(event);
  }

  protected onPointerAdd(_event: GHEvent): void {
    this.offsetX += this.lastX - this.startX;
    this.offsetY += this.lastY = this.startY;

    this.lastX = this.tracker.getLastAvgX();
    this.lastY = this.tracker.getLastAvgY();

    this.startX = this.lastX;
    this.startY = this.lastY;
  }

  protected onUpAction(event: GHEvent): void {
    if (this.tracker.getTrackedPointersNumber() > 1) {
      this.tracker.removeFromTracker(event.pointerId);

      event.eventType = EventTypes.POINTER_UP;
      this.onPointerRemove(event);
    } else {
      this.lastX = this.tracker.getLastAvgX();
      this.lastY = this.tracker.getLastAvgY();

      this.tracker.removeFromTracker(event.pointerId);
    }

    this.commonAction(event);
  }

  protected onPointerRemove(_event: GHEvent): void {
    this.offsetX += this.lastX - this.startX;
    this.offsetY += this.lastY = this.startY;

    this.lastX = this.tracker.getLastAvgX();
    this.lastY = this.tracker.getLastAvgY();

    this.startX = this.lastX;
    this.startY = this.lastY;
  }

  protected onEnterAction(_event: GHEvent): void {
    //
  }
  protected onOutAction(_event: GHEvent): void {
    //
  }
  protected onMoveAction(event: GHEvent): void {
    this.checkUndetermined(event);

    this.lastX = this.tracker.getLastAvgX();
    this.lastY = this.tracker.getLastAvgY();

    this.commonAction(event);
  }
  protected onOutOfBoundsAction(event: GHEvent): void {
    this.checkUndetermined(event);

    this.lastX = this.tracker.getLastAvgX();
    this.lastY = this.tracker.getLastAvgY();

    this.commonAction(event);
  }

  protected onCancelAction(event: GHEvent): void {
    this.tracker.resetTracker();
    this.fail(event);
  }

  private commonAction(event: GHEvent): void {
    if (
      this.currentMaxNumberOfPointers < this.tracker.getTrackedPointersNumber()
    ) {
      this.currentMaxNumberOfPointers = this.tracker.getTrackedPointersNumber();
    }

    if (this.shouldFail()) {
      this.fail(event);
      return;
    }

    switch (this.currentState) {
      case State.UNDETERMINED:
        if (event.eventType === EventTypes.DOWN) this.begin(event);
        this.startTap(event);
        break;
      case State.BEGAN:
        if (event.eventType === EventTypes.UP) this.endTap(event);
        if (event.eventType === EventTypes.DOWN) this.startTap(event);
        break;
      default:
        break;
    }
  }

  private checkUndetermined(event: GHEvent): void {
    if (this.currentState !== State.UNDETERMINED) return;

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

    const dist = dy * dy + dx * dx;

    return this.maxDistSq !== Number.MIN_SAFE_INTEGER && dist > this.maxDistSq;
  }

  protected activate(event: GHEvent): void {
    super.activate(event);

    if (!this.isAwaiting()) {
      this.end(event);
    }
  }

  protected onCancel(): void {
    this.resetProgress();
    this.clearTimeouts();
  }

  protected resetProgress(): void {
    this.onReset();
  }

  protected onReset(): void {
    this.tapsSoFar = 0;
    this.currentMaxNumberOfPointers = 0;
  }
}
