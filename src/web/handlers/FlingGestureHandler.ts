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
  private _numberOfPointersRequired = DEFAULT_NUMBER_OF_TOUCHES_REQUIRED;
  private _direction: Directions = DEFAULT_DIRECTION;
  private _maxDurationMs = DEFAULT_MAX_DURATION_MS;
  private _minVelocity = DEFAULT_MIN_VELOCITY;
  private _delayTimeout!: number;
  private _maxNumberOfPointersSimultaneously = 0;
  private _keyPointer = NaN;

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

  private startFling(): void {
    this.begin();

    this.maxNumberOfPointersSimultaneously = 1;

    this.delayTimeout = setTimeout(() => this.fail(), this.maxDurationMs);
  }

  private tryEndFling(): boolean {
    const velocityVector = Vector.fromVelocity(
      this.pointerTracker,
      this.keyPointer
    );

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

  protected onPointerDown(event: AdaptedEvent): void {
    if (!this.isButtonInConfig(event.button)) {
      return;
    }

    this.pointerTracker.addToTracker(event);
    this.keyPointer = event.pointerId;

    super.onPointerDown(event);
    this.newPointerAction();

    this.tryToSendTouchEvent(event);
  }

  protected onPointerAdd(event: AdaptedEvent): void {
    this.pointerTracker.addToTracker(event);
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
      this.pointerTracker.getTrackedPointersCount() >
      this.maxNumberOfPointersSimultaneously
    ) {
      this.maxNumberOfPointersSimultaneously =
        this.pointerTracker.getTrackedPointersCount();
    }
  }

  private pointerMoveAction(event: AdaptedEvent): void {
    this.pointerTracker.track(event);

    if (this.state !== State.BEGAN) {
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
    if (this.state === State.BEGAN) {
      this.endFling();
    }

    this.pointerTracker.removeFromTracker(event.pointerId);
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

  public get numberOfPointersRequired() {
    return this._numberOfPointersRequired;
  }
  public set numberOfPointersRequired(value: number) {
    this._numberOfPointersRequired = value;
  }

  public get direction() {
    return this._direction;
  }
  public set direction(direction: Directions) {
    this._direction = direction;
  }

  public get maxDurationMs() {
    return this._maxDurationMs;
  }
  public set maxDurationMs(value: number) {
    this._maxDurationMs = value;
  }

  public get minVelocity() {
    return this._minVelocity;
  }
  public set minVelocity(value: number) {
    this._minVelocity = value;
  }

  public get delayTimeout() {
    return this._delayTimeout;
  }
  public set delayTimeout(value: number) {
    this._delayTimeout = value;
  }

  public get maxNumberOfPointersSimultaneously() {
    return this._maxNumberOfPointersSimultaneously;
  }
  public set maxNumberOfPointersSimultaneously(value: number) {
    this._maxNumberOfPointersSimultaneously = value;
  }

  public get keyPointer() {
    return this._keyPointer;
  }
  public set keyPointer(value: number) {
    this._keyPointer = value;
  }
}
