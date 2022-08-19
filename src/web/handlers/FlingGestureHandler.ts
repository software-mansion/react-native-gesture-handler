import { State } from '../../State';
import { Direction } from '../constants';
import { AdaptedPointerEvent } from '../interfaces';

import GestureHandler from './GestureHandler';

const DEFAULT_MAX_DURATION_MS = 800;
const DEFAULT_MIN_ACCEPTABLE_DELTA = 160;
const DEFAULT_DIRECTION = Direction.RIGHT;
const DEFAULT_NUMBER_OF_TOUCHES_REQUIRED = 1;

export default class FlingGestureHandler extends GestureHandler {
  private numberOfPointersRequired = DEFAULT_NUMBER_OF_TOUCHES_REQUIRED;
  private direction = DEFAULT_DIRECTION;

  private maxDurationMs = DEFAULT_MAX_DURATION_MS;
  private minAcceptableDelta = DEFAULT_MIN_ACCEPTABLE_DELTA;
  private delayTimeout!: number;

  private startX = 0;
  private startY = 0;

  private maxNumberOfPointersSimultaneously = 0;

  public init(ref: number, propsRef: React.RefObject<unknown>): void {
    super.init(ref, propsRef);
  }

  public updateGestureConfig({ enabled = true, ...props }): void {
    super.updateGestureConfig({ enabled: enabled, ...props });

    this.enabled = enabled;

    if (this.config.direction) {
      this.direction = this.config.direction;
    }

    if (this.config.numberOfPointers) {
      this.numberOfPointersRequired = this.config.numberOfPointers;
    }
  }

  protected transformNativeEvent(event: AdaptedPointerEvent) {
    return {
      x: event.offsetX,
      y: event.offsetY,
      absoluteX: event.x,
      absoluteY: event.y,
    };
  }

  private startFling(event: AdaptedPointerEvent): void {
    this.startX = event.x;
    this.startY = event.y;

    this.begin(event);

    this.maxNumberOfPointersSimultaneously = 1;

    this.delayTimeout = setTimeout(() => this.fail(event), this.maxDurationMs);
  }

  private tryEndFling(event: AdaptedPointerEvent): boolean {
    if (
      this.maxNumberOfPointersSimultaneously ===
        this.numberOfPointersRequired &&
      ((this.direction & Direction.RIGHT &&
        event.x - this.startX > this.minAcceptableDelta) ||
        (this.direction & Direction.LEFT &&
          this.startX - event.x > this.minAcceptableDelta) ||
        (this.direction & Direction.UP &&
          this.startY - event.y > this.minAcceptableDelta) ||
        (this.direction & Direction.DOWN &&
          event.y - this.startY > this.minAcceptableDelta))
    ) {
      clearTimeout(this.delayTimeout);
      this.activate(event);

      return true;
    }

    return false;
  }

  private endFling(event: AdaptedPointerEvent) {
    if (!this.tryEndFling(event)) {
      this.fail(event);
    }
  }

  protected onPointerDown(event: AdaptedPointerEvent): void {
    super.onPointerDown(event);

    this.tracker.addToTracker(event);

    if (this.currentState === State.UNDETERMINED) {
      this.startFling(event);
    }

    if (this.currentState !== State.BEGAN) {
      return;
    }

    this.tryEndFling(event);

    if (
      this.tracker.getTrackedPointersCount() >
      this.maxNumberOfPointersSimultaneously
    ) {
      this.maxNumberOfPointersSimultaneously = this.tracker.getTrackedPointersCount();
    }
  }

  protected onPointerMove(event: AdaptedPointerEvent): void {
    this.tracker.track(event);

    if (this.currentState !== State.BEGAN) {
      return;
    }

    this.tryEndFling(event);

    super.onPointerMove(event);
  }

  protected onPointerUp(event: AdaptedPointerEvent): void {
    this.tracker.removeFromTracker(event.pointerId);

    if (this.currentState !== State.BEGAN) {
      return;
    }

    this.endFling(event);
  }

  protected activate(event: AdaptedPointerEvent, force?: boolean): void {
    super.activate(event, force);
    this.end(event);
  }

  protected resetConfig(): void {
    super.resetConfig();
    this.numberOfPointersRequired = DEFAULT_NUMBER_OF_TOUCHES_REQUIRED;
    this.direction = DEFAULT_DIRECTION;
  }
}
