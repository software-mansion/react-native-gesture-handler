import { State } from '../../State';
import { Direction } from '../constants';
import { AdaptedEvent, Config } from '../interfaces';

import GestureHandler from './GestureHandler';

const DEFAULT_MAX_DURATION_MS = 800;
const DEFAULT_MIN_VELOCITY = 400;
const DEFAULT_MIN_DIRECTION_ALIGNMENT = 0.75;
const DEFAULT_DIRECTION = Direction.RIGHT;
const DEFAULT_NUMBER_OF_TOUCHES_REQUIRED = 1;

export default class FlingGestureHandler extends GestureHandler {
  private numberOfPointersRequired = DEFAULT_NUMBER_OF_TOUCHES_REQUIRED;
  private direction = DEFAULT_DIRECTION;
  private shouldCancelWhenOutside = false;

  private maxDurationMs = DEFAULT_MAX_DURATION_MS;
  private minVelocity = DEFAULT_MIN_VELOCITY;
  private minDirectionAlignment = DEFAULT_MIN_DIRECTION_ALIGNMENT;
  private delayTimeout!: number;

  private maxNumberOfPointersSimultaneously = 0;
  private keyPointer = NaN;

  public init(ref: number, propsRef: React.RefObject<unknown>): void {
    super.init(ref, propsRef);

    this.setShouldCancelWhenOutside(this.shouldCancelWhenOutside);
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
    type SimpleVector = { x: number; y: number };

    const toSafeNumber = (unsafe: number): number => {
      return Number.isNaN(unsafe) ? 0 : unsafe;
    };

    const toUnitVector = (vec: SimpleVector): SimpleVector => {
      const magnitude = Math.hypot(vec.x, vec.y);
      // division by 0 may occur here
      return {
        x: toSafeNumber(vec.x / magnitude),
        y: toSafeNumber(vec.y / magnitude),
      };
    };

    const compareSimilarity = (
      vecA: SimpleVector,
      vecB: SimpleVector
    ): number => {
      const unitA = toUnitVector(vecA);
      const unitB = toUnitVector(vecB);
      // returns scalar on range from -1.0 to 1.0
      return unitA.x * unitB.x + unitA.y * unitB.y;
    };

    const compareAlignment = (
      vec: SimpleVector,
      directionVec: SimpleVector,
      direction: number
    ): boolean => {
      return !!(
        compareSimilarity(vec, directionVec) > this.minDirectionAlignment &&
        this.direction & direction
      );
    };

    const velocityVector: SimpleVector = {
      x: this.tracker.getVelocityX(this.keyPointer),
      y: this.tracker.getVelocityY(this.keyPointer),
    };

    // list of alignments to all activated directions
    const alignmentList = [
      compareAlignment(velocityVector, { x: -1, y: 0 }, Direction.LEFT),
      compareAlignment(velocityVector, { x: 1, y: 0 }, Direction.RIGHT),
      compareAlignment(velocityVector, { x: 0, y: -1 }, Direction.UP),
      compareAlignment(velocityVector, { x: 0, y: 1 }, Direction.DOWN),
    ];

    const totalVelocity = Math.hypot(velocityVector.x, velocityVector.y);

    const isAligned = alignmentList.reduce((any, element) => any || element);
    const isFast = totalVelocity > this.minVelocity;

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

  protected pointerMove(event: AdaptedEvent): void {
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
