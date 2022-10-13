import { State } from '../../State';
import { Direction } from '../constants';
import { AdaptedEvent, Config } from '../interfaces';

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
  private keyPointer = NaN;

  public init(ref: number, propsRef: React.RefObject<unknown>): void {
    super.init(ref, propsRef);
  }

  public updateGestureConfig({ enabled = true, ...props }: Config): void {
    super.updateGestureConfig({ enabled: enabled, ...props });

    if (this.config.direction) {
      this.direction = this.config.direction;
    }

    if (this.config.numberOfPointers) {
      this.numberOfPointersRequired = this.config.numberOfPointers;
    }
  }

  protected transformNativeEvent() {
    const rect: DOMRect = this.view.getBoundingClientRect();

    return {
      x: this.tracker.getLastAvgX() - rect.left,
      y: this.tracker.getLastAvgY() - rect.top,
      absoluteX: this.tracker.getLastAvgX(),
      absoluteY: this.tracker.getLastAvgY(),
    };
  }

  private startFling(): void {
    this.startX = this.tracker.getLastX(this.keyPointer);
    this.startY = this.tracker.getLastY(this.keyPointer);

    this.begin();

    this.maxNumberOfPointersSimultaneously = 1;

    this.delayTimeout = setTimeout(() => this.fail(), this.maxDurationMs);
  }

  private tryEndFling(): boolean {
    if (
      this.maxNumberOfPointersSimultaneously ===
        this.numberOfPointersRequired &&
      ((this.direction & Direction.RIGHT &&
        this.tracker.getLastX(this.keyPointer) - this.startX >
          this.minAcceptableDelta) ||
        (this.direction & Direction.LEFT &&
          this.startX - this.tracker.getLastX(this.keyPointer) >
            this.minAcceptableDelta) ||
        (this.direction & Direction.UP &&
          this.startY - this.tracker.getLastY(this.keyPointer) >
            this.minAcceptableDelta) ||
        (this.direction & Direction.DOWN &&
          this.tracker.getLastY(this.keyPointer) - this.startY >
            this.minAcceptableDelta))
    ) {
      clearTimeout(this.delayTimeout);
      this.activate();

      return true;
    }

    return false;
  }

  private endFling() {
    if (!this.tryEndFling()) {
      this.fail();
    }
  }

  protected onPointerDown(event: AdaptedEvent): void {
    this.tracker.addToTracker(event);
    this.keyPointer = event.pointerId;

    super.onPointerDown(event);
    this.newPointerAction();
  }

  protected onPointerAdd(event: AdaptedEvent): void {
    this.tracker.addToTracker(event);
    super.onPointerAdd(event);
    this.newPointerAction();
  }

  private newPointerAction(): void {
    if (this.currentState === State.UNDETERMINED) {
      this.startFling();
    }

    if (this.currentState !== State.BEGAN) {
      return;
    }

    this.tryEndFling();

    if (
      this.tracker.getTrackedPointersCount() >
      this.maxNumberOfPointersSimultaneously
    ) {
      this.maxNumberOfPointersSimultaneously =
        this.tracker.getTrackedPointersCount();
    }
  }

  protected onPointerMove(event: AdaptedEvent): void {
    this.tracker.track(event);

    if (this.currentState !== State.BEGAN) {
      return;
    }

    this.tryEndFling();

    super.onPointerMove(event);
  }

  protected onPointerUp(event: AdaptedEvent): void {
    super.onPointerUp(event);
    this.onUp(event);

    this.keyPointer = NaN;
  }

  protected onPointerRemove(event: AdaptedEvent): void {
    super.onPointerRemove(event);
    this.onUp(event);
  }

  private onUp(event: AdaptedEvent): void {
    this.tracker.removeFromTracker(event.pointerId);
    if (this.currentState !== State.BEGAN) {
      return;
    }
    this.endFling();
  }

  protected onPointerCancel(event: AdaptedEvent): void {
    super.onPointerCancel(event);
    this.reset();
  }

  public activate(force?: boolean): void {
    super.activate(force);
    this.end();
  }

  protected resetConfig(): void {
    super.resetConfig();
    this.numberOfPointersRequired = DEFAULT_NUMBER_OF_TOUCHES_REQUIRED;
    this.direction = DEFAULT_DIRECTION;
  }
}
