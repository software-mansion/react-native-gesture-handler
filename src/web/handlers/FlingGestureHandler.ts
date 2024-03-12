import { State } from '../../State';
import { Direction } from '../constants';
import { AdaptedEvent, Config } from '../interfaces';
import PointerTracker from '../tools/PointerTracker';

import GestureHandler from './GestureHandler';

const DEFAULT_MAX_DURATION_MS = 800;
const DEFAULT_MIN_VELOCITY = 700;
const DEFAULT_MIN_DIRECTION_ALIGNMENT = 0.75;
const DEFAULT_DIRECTION = Direction.RIGHT;
const DEFAULT_NUMBER_OF_TOUCHES_REQUIRED = 1;

class Vector {
  x: number = 0;
  y: number = 0;
  uX: number = 0;
  uY: number = 0;

  fromDirection(direction: number) {
    [this.x, this.y] = [this.uX, this.uY] = new Map([
      [Direction.LEFT, [-1, 0]],
      [Direction.RIGHT, [1, 0]],
      [Direction.UP, [0, -1]],
      [Direction.DOWN, [0, 1]],
    ]).get(direction) ?? [0.0, 0.0];

    return this;
  }

  fromVelocity(tracker: PointerTracker, pointerId: number) {
    this.x = tracker.getVelocityX(pointerId);
    this.y = tracker.getVelocityY(pointerId);

    const magnitude = Math.hypot(this.x, this.y);
    if (magnitude < 0.001) {
      this.uX = this.uY = 0;
    }

    this.uX = this.x / magnitude;
    this.uY = this.y / magnitude;

    return this;
  }

  computeSimilarity(vector: any) {
    return this.uX * vector.uX + this.uY * vector.uY;
  }

  computeMagnitude() {
    return Math.hypot(this.x, this.y);
  }
}

export default class FlingGestureHandler extends GestureHandler {
  private numberOfPointersRequired = DEFAULT_NUMBER_OF_TOUCHES_REQUIRED;
  private direction = DEFAULT_DIRECTION;

  private maxDurationMs = DEFAULT_MAX_DURATION_MS;
  private minVelocity = DEFAULT_MIN_VELOCITY;
  private minDirectionalAlignment = DEFAULT_MIN_DIRECTION_ALIGNMENT;
  private delayTimeout!: number;

  private maxNumberOfPointersSimultaneously = 0;
  private keyPointer = NaN;

  public init(ref: number, propsRef: React.RefObject<unknown>): void {
    super.init(ref, propsRef);

    this.setShouldCancelWhenOutside(this.shouldCancellWhenOutside);
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

  private startFling(): void {
    this.begin();

    this.maxNumberOfPointersSimultaneously = 1;

    this.delayTimeout = setTimeout(() => this.fail(), this.maxDurationMs);
  }

  private tryEndFling(): boolean {
    const velocityVector = new Vector().fromVelocity(
      this.tracker,
      this.keyPointer
    );

    // list of alignments to all activated directions
    const alignmentList = [
      Direction.LEFT,
      Direction.RIGHT,
      Direction.UP,
      Direction.DOWN,
    ].map(
      (direction) =>
        velocityVector.computeSimilarity(
          new Vector().fromDirection(direction)
        ) > this.minDirectionalAlignment && direction & this.direction
    );

    const isAligned = alignmentList.some((element) => element);
    const isFast = velocityVector.computeMagnitude() > this.minVelocity;

    if (
      this.maxNumberOfPointersSimultaneously ===
        this.numberOfPointersRequired &&
      isAligned &&
      isFast
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
    if (!this.isButtonInConfig(event.button)) {
      return;
    }

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

  private pointerMove(event: AdaptedEvent): void {
    this.tracker.track(event);

    if (this.currentState !== State.BEGAN) {
      return;
    }

    this.tryEndFling();

    super.onPointerMove(event);
  }

  protected onPointerMove(event: AdaptedEvent): void {
    this.pointerMove(event);
  }

  protected onPointerOutOfBounds(event: AdaptedEvent): void {
    this.pointerMove(event);
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
    if (this.currentState === State.BEGAN) {
      this.endFling();
    }

    this.tracker.removeFromTracker(event.pointerId);
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
