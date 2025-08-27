import { State } from '../../State';
import { AdaptedEvent, Config, EventTypes } from '../interfaces';

import GestureHandler from './GestureHandler';

const DEFAULT_MAX_DURATION_MS = 500;
const DEFAULT_MAX_DELAY_MS = 500;
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

  public override updateGestureConfig(config: Config): void {
    super.updateGestureConfig(config);

    if (config.numberOfTaps !== undefined) {
      this.numberOfTaps = config.numberOfTaps;
    }

    if (config.maxDurationMs !== undefined) {
      this.maxDurationMs = config.maxDurationMs;
    }

    if (config.maxDelayMs !== undefined) {
      this.maxDelayMs = config.maxDelayMs;
    }

    if (config.maxDeltaX !== undefined) {
      this.maxDeltaX = config.maxDeltaX;
    }

    if (config.maxDeltaY !== undefined) {
      this.maxDeltaY = config.maxDeltaY;
    }

    if (config.maxDist !== undefined) {
      this.maxDistSq = config.maxDist * config.maxDist;
    }

    if (config.minPointers !== undefined) {
      this.minNumberOfPointers = config.minPointers;
    }
  }

  protected override resetConfig(): void {
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

  private updateLastCoords() {
    const { x, y } = this.tracker.getAbsoluteCoordsAverage();

    this.lastX = x;
    this.lastY = y;
  }

  // Handling Events
  protected override onPointerDown(event: AdaptedEvent): void {
    if (!this.isButtonInConfig(event.button)) {
      return;
    }

    this.tracker.addToTracker(event);
    super.onPointerDown(event);

    this.trySettingPosition(event);

    this.startX = event.x;
    this.startY = event.y;

    this.lastX = event.x;
    this.lastY = event.y;

    this.updateState(event);

    this.tryToSendTouchEvent(event);
  }

  protected override onPointerAdd(event: AdaptedEvent): void {
    super.onPointerAdd(event);
    this.tracker.addToTracker(event);
    this.trySettingPosition(event);

    this.offsetX += this.lastX - this.startX;
    this.offsetY += this.lastY - this.startY;

    this.updateLastCoords();

    this.startX = this.lastX;
    this.startY = this.lastY;

    this.updateState(event);
  }

  protected override onPointerUp(event: AdaptedEvent): void {
    super.onPointerUp(event);

    this.updateLastCoords();

    this.tracker.removeFromTracker(event.pointerId);

    this.updateState(event);
  }

  protected override onPointerRemove(event: AdaptedEvent): void {
    super.onPointerRemove(event);
    this.tracker.removeFromTracker(event.pointerId);

    this.offsetX += this.lastX - this.startX;
    this.offsetY += this.lastY = this.startY;

    this.updateLastCoords();

    this.startX = this.lastX;
    this.startY = this.lastY;

    this.updateState(event);
  }

  protected override onPointerMove(event: AdaptedEvent): void {
    this.trySettingPosition(event);
    this.tracker.track(event);

    this.updateLastCoords();
    this.updateState(event);

    super.onPointerMove(event);
  }

  protected override onPointerOutOfBounds(event: AdaptedEvent): void {
    this.trySettingPosition(event);
    this.tracker.track(event);

    this.updateLastCoords();
    this.updateState(event);

    super.onPointerOutOfBounds(event);
  }

  private updateState(event: AdaptedEvent): void {
    if (this.currentMaxNumberOfPointers < this.tracker.trackedPointersCount) {
      this.currentMaxNumberOfPointers = this.tracker.trackedPointersCount;
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

  public override activate(): void {
    super.activate();

    this.end();
  }

  protected override onCancel(): void {
    this.resetProgress();
    this.clearTimeouts();
  }

  protected override resetProgress(): void {
    this.clearTimeouts();
    this.tapsSoFar = 0;
    this.currentMaxNumberOfPointers = 0;
  }
}
