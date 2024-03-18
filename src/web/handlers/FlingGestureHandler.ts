import { State } from '../../State';
import { CornerDirections, Directions } from '../../Directions';
import { AdaptedEvent, Config } from '../interfaces';

import GestureHandler from './GestureHandler';
import Vector from '../tools/Vector';

const DEFAULT_MAX_DURATION_MS = 800;
const DEFAULT_MIN_VELOCITY = 700;
const DEFAULT_MIN_DIRECTION_ALIGNMENT = 20;
const DEFAULT_DIRECTION = Directions.RIGHT;
const DEFAULT_NUMBER_OF_TOUCHES_REQUIRED = 1;

export default class FlingGestureHandler extends GestureHandler {
  private numberOfPointersRequired = DEFAULT_NUMBER_OF_TOUCHES_REQUIRED;
  private direction: Directions = DEFAULT_DIRECTION;

  private maxDurationMs = DEFAULT_MAX_DURATION_MS;
  private minVelocity = DEFAULT_MIN_VELOCITY;
  private minDirectionalAlignment = DEFAULT_MIN_DIRECTION_ALIGNMENT;
  private delayTimeout!: number;

  private maxNumberOfPointersSimultaneously = 0;
  private keyPointer = NaN;

  private minimalAlignmentCosine = 0;
  private minimalCornerAlignmentCosine = 0;

  public init(ref: number, propsRef: React.RefObject<unknown>): void {
    super.init(ref, propsRef);

    const degToRad = (degrees: number) => (degrees * Math.PI) / 180;

    const alignmentRadians = degToRad(this.minDirectionalAlignment);
    const cornerAreaRadians = degToRad(45 - this.minDirectionalAlignment);

    this.minimalAlignmentCosine = Math.cos(alignmentRadians);
    this.minimalCornerAlignmentCosine = Math.cos(cornerAreaRadians);
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
    const velocityVector = Vector.fromVelocity(this.tracker, this.keyPointer);

    const getAlignment = (
      direction: Directions | CornerDirections,
      minimalAlignmentCosine: number
    ) => {
      return (
        (direction & this.direction) === direction &&
        velocityVector.isSimilar(
          Vector.fromDirection(direction),
          minimalAlignmentCosine
        )
      );
    };

    // list of alignments to all activated directions
    const alignmentList = Object.values(Directions).map((direction) =>
      getAlignment(direction, this.minimalAlignmentCosine)
    );

    const cornerFillAlignmentList = Object.values(CornerDirections).map(
      (direction) => getAlignment(direction, this.minimalCornerAlignmentCosine)
    );

    const isAligned =
      alignmentList.some(Boolean) || cornerFillAlignmentList.some(Boolean);
    const isFast = velocityVector.magnitude > this.minVelocity;

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

  private pointerMoveAction(event: AdaptedEvent): void {
    this.tracker.track(event);

    if (this.currentState !== State.BEGAN) {
      return;
    }

    this.tryEndFling();
  }

  protected onPointerMove(event: AdaptedEvent): void {
    this.pointerMoveAction(event);
    super.onPointerMove(event);
  }

  protected onPointerOutOfBounds(event: AdaptedEvent): void {
    this.pointerMoveAction(event);
    super.onPointerOutOfBounds(event);
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
