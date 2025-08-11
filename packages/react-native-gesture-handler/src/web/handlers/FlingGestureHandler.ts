import { State } from '../../State';
import { DiagonalDirections, Directions } from '../../Directions';
import { AdaptedEvent, Config } from '../interfaces';

import GestureHandler from './GestureHandler';
import Vector from '../tools/Vector';
import { coneToDeviation } from '../utils';

const DEFAULT_MAX_DURATION_MS = 800;
const DEFAULT_MIN_VELOCITY = 700;
const DEFAULT_ALIGNMENT_CONE = 30;
const DEFAULT_DIRECTION = Directions.RIGHT;
const DEFAULT_NUMBER_OF_TOUCHES_REQUIRED = 1;

const AXIAL_DEVIATION_COSINE = coneToDeviation(DEFAULT_ALIGNMENT_CONE);
const DIAGONAL_DEVIATION_COSINE = coneToDeviation(90 - DEFAULT_ALIGNMENT_CONE);

export default class FlingGestureHandler extends GestureHandler {
  private numberOfPointersRequired = DEFAULT_NUMBER_OF_TOUCHES_REQUIRED;
  private direction: Directions = DEFAULT_DIRECTION;

  private maxDurationMs = DEFAULT_MAX_DURATION_MS;
  private minVelocity = DEFAULT_MIN_VELOCITY;
  private delayTimeout!: number;

  private maxNumberOfPointersSimultaneously = 0;
  private keyPointer = NaN;

  public override updateGestureConfig({
    enabled = true,
    ...props
  }: Config): void {
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

    if (!velocityVector) {
      return false;
    }

    const getAlignment = (
      direction: Directions | DiagonalDirections,
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

    const axialDirectionsList = Object.values(Directions);
    const diagonalDirectionsList = Object.values(DiagonalDirections);

    // List of alignments to all activated directions
    const axialAlignmentList = axialDirectionsList.map((direction) =>
      getAlignment(direction, AXIAL_DEVIATION_COSINE)
    );

    const diagonalAlignmentList = diagonalDirectionsList.map((direction) =>
      getAlignment(direction, DIAGONAL_DEVIATION_COSINE)
    );

    const isAligned =
      axialAlignmentList.some(Boolean) || diagonalAlignmentList.some(Boolean);

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

  protected override onPointerDown(event: AdaptedEvent): void {
    if (!this.isButtonInConfig(event.button)) {
      return;
    }

    this.tracker.addToTracker(event);
    this.keyPointer = event.pointerId;

    super.onPointerDown(event);
    this.newPointerAction();

    this.tryToSendTouchEvent(event);
  }

  protected override onPointerAdd(event: AdaptedEvent): void {
    this.tracker.addToTracker(event);
    super.onPointerAdd(event);
    this.newPointerAction();
  }

  private newPointerAction(): void {
    if (this.state === State.UNDETERMINED) {
      this.startFling();
    }

    if (this.state !== State.BEGAN) {
      return;
    }

    this.tryEndFling();

    if (
      this.tracker.trackedPointersCount > this.maxNumberOfPointersSimultaneously
    ) {
      this.maxNumberOfPointersSimultaneously =
        this.tracker.trackedPointersCount;
    }
  }

  private pointerMoveAction(event: AdaptedEvent): void {
    this.tracker.track(event);

    if (this.state !== State.BEGAN) {
      return;
    }

    this.tryEndFling();
  }

  protected override onPointerMove(event: AdaptedEvent): void {
    this.pointerMoveAction(event);
    super.onPointerMove(event);
  }

  protected override onPointerOutOfBounds(event: AdaptedEvent): void {
    this.pointerMoveAction(event);
    super.onPointerOutOfBounds(event);
  }

  protected override onPointerUp(event: AdaptedEvent): void {
    super.onPointerUp(event);
    this.onUp(event);

    this.keyPointer = NaN;
  }

  protected override onPointerRemove(event: AdaptedEvent): void {
    super.onPointerRemove(event);
    this.onUp(event);
  }

  private onUp(event: AdaptedEvent): void {
    if (this.state === State.BEGAN) {
      this.endFling();
    }

    this.tracker.removeFromTracker(event.pointerId);
  }

  public override activate(force?: boolean): void {
    super.activate(force);
    this.end();
  }

  protected override resetConfig(): void {
    super.resetConfig();
    this.numberOfPointersRequired = DEFAULT_NUMBER_OF_TOUCHES_REQUIRED;
    this.direction = DEFAULT_DIRECTION;
  }
}
