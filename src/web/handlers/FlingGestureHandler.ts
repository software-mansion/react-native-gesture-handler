import { State } from '../../State';
import { Direction } from '../constants';
import { GHEvent } from '../tools/EventManager';
import GestureHandler from './GestureHandler';

export default class FlingGestureHandler extends GestureHandler {
  private readonly DEFAULT_MAX_DURATION_MS = 800;
  private readonly DEFAULT_MIN_ACCEPTABLE_DELTA = 160;
  private readonly DEFAULT_DIRECTION = Direction.RIGHT;
  private readonly DEFAULT_NUMBER_OF_TOUCHES_REQUIRED = 1;

  private numberOfPointersRequired = this.DEFAULT_NUMBER_OF_TOUCHES_REQUIRED;
  private direction = this.DEFAULT_DIRECTION;

  private maxDurationMs = this.DEFAULT_MAX_DURATION_MS;
  private minAcceptableDelta = this.DEFAULT_MIN_ACCEPTABLE_DELTA;
  private startX = 0;
  private startY = 0;
  private maxNumberOfPointersSimultaneously = 0;

  private delayTimeout!: number;

  public init(ref: number, propsRef: any): void {
    super.init(ref, propsRef);
  }

  public updateGestureConfig({ ...props }): void {
    super.updateGestureConfig({ enabled: true, ...props });

    for (const key in this.config) {
      if (
        !isNaN(this.config[key]) &&
        this.config[key] !== undefined &&
        this.config[key] !== null
      ) {
        this.hasCustomActivationCriteria = true;
      }
    }

    this.enabled = this.config.enabled as boolean;

    if (this.config.direction) {
      this.direction = this.config.direction as number;
    }

    if (this.config.numberOfPointers) {
      this.numberOfPointersRequired = this.config.numberOfPointers as number;
    }
  }

  get name(): string {
    return 'fling';
  }

  private startFling(event: GHEvent): void {
    this.startX = event.x;
    this.startY = event.y;

    this.begin(event);

    this.maxNumberOfPointersSimultaneously = 1;

    this.delayTimeout = setTimeout(() => this.fail(event), this.maxDurationMs);
  }

  private tryEndFling(event: GHEvent): boolean {
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

  private endFling(event: GHEvent) {
    if (!this.tryEndFling(event)) this.fail(event);
  }

  protected onDownAction(event: GHEvent): void {
    this.tracker.addToTracker(event);

    if (this.getState() === State.UNDETERMINED) {
      this.startFling(event);
    }

    if (this.getState() !== State.BEGAN) return;

    this.tryEndFling(event);

    if (
      this.tracker.getTrackedPointersNumber() >
      this.maxNumberOfPointersSimultaneously
    ) {
      this.maxNumberOfPointersSimultaneously = this.tracker.getTrackedPointersNumber();
    }
  }

  protected onMoveAction(event: GHEvent): void {
    this.tracker.track(event);

    if (this.getState() !== State.BEGAN) return;

    this.tryEndFling(event);

    super.onMoveAction(event);
  }

  protected onUpAction(event: GHEvent): void {
    this.tracker.removeFromTracker(event.pointerId);

    if (this.getState() !== State.BEGAN) return;

    this.endFling(event);
  }

  protected activate(event: GHEvent, force?: boolean): void {
    super.activate(event, force);
    this.end(event);
  }

  protected resetConfig(): void {
    super.resetConfig();
    this.numberOfPointersRequired = this.DEFAULT_NUMBER_OF_TOUCHES_REQUIRED;
    this.direction = this.DEFAULT_DIRECTION;
  }

  protected onCancel(): void {
    // throw new Error('Method not implemented.');
  }
  protected onReset(): void {
    // throw new Error('Method not implemented.');
  }
}
