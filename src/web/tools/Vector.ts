import { Directions } from '../../Directions';
import { MINIMAL_FLING_VELOCITY } from '../constants';
import PointerTracker from './PointerTracker';

export default class Vector {
  x = 0;
  y = 0;
  unitX = 0;
  unitY = 0;
  magnitude = 0;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;

    this.magnitude = Math.hypot(this.x, this.y);
    const isMagnitudeSufficient = this.magnitude > MINIMAL_FLING_VELOCITY;

    this.unitX = isMagnitudeSufficient ? this.x / this.magnitude : 0;
    this.unitY = isMagnitudeSufficient ? this.y / this.magnitude : 0;
  }

  static fromDirection(direction: Directions) {
    return DirectionToVectorMappings.get(direction)!;
  }

  static fromVelocity(tracker: PointerTracker, pointerId: number) {
    return new Vector(
      tracker.getVelocityX(pointerId),
      tracker.getVelocityY(pointerId)
    );
  }

  computeSimilarity(vector: Vector) {
    return this.unitX * vector.unitX + this.unitY * vector.unitY;
  }

  isSimilar(vector: Vector, threshold: number) {
    return this.computeSimilarity(vector) > threshold;
  }
}

const DirectionToVectorMappings = new Map<Directions, Vector>([
  [Directions.LEFT, new Vector(-1, 0)],
  [Directions.RIGHT, new Vector(1, 0)],
  [Directions.UP, new Vector(0, -1)],
  [Directions.DOWN, new Vector(0, 1)],
]);
