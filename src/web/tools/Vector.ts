import { DiagonalDirections, Directions } from '../../Directions';
import { MINIMAL_FLING_VELOCITY } from '../constants';
import PointerTracker from './PointerTracker';

export default class Vector {
  private readonly x;
  private readonly y;
  private readonly unitX;
  private readonly unitY;
  private readonly _magnitude;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;

    this._magnitude = Math.hypot(this.x, this.y);
    const isMagnitudeSufficient = this._magnitude > MINIMAL_FLING_VELOCITY;

    this.unitX = isMagnitudeSufficient ? this.x / this._magnitude : 0;
    this.unitY = isMagnitudeSufficient ? this.y / this._magnitude : 0;
  }

  static fromDirection(direction: Directions | DiagonalDirections): Vector {
    return DirectionToVectorMappings.get(direction)!;
  }

  static fromVelocity(tracker: PointerTracker, pointerId: number) {
    return new Vector(
      tracker.getVelocityX(pointerId),
      tracker.getVelocityY(pointerId)
    );
  }

  get magnitude() {
    return this._magnitude;
  }

  computeSimilarity(vector: Vector) {
    return this.unitX * vector.unitX + this.unitY * vector.unitY;
  }

  isSimilar(vector: Vector, threshold: number) {
    return this.computeSimilarity(vector) > threshold;
  }
}

const DirectionToVectorMappings = new Map<
  Directions | DiagonalDirections,
  Vector
>([
  [Directions.LEFT, new Vector(-1, 0)],
  [Directions.RIGHT, new Vector(1, 0)],
  [Directions.UP, new Vector(0, -1)],
  [Directions.DOWN, new Vector(0, 1)],

  [DiagonalDirections.UP_RIGHT, new Vector(1, -1)],
  [DiagonalDirections.DOWN_RIGHT, new Vector(1, 1)],
  [DiagonalDirections.UP_LEFT, new Vector(-1, -1)],
  [DiagonalDirections.DOWN_LEFT, new Vector(-1, 1)],
]);
