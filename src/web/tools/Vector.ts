import { Directions } from '../../Directions';
import PointerTracker from './PointerTracker';

export default class Vector {
  x: number = 0;
  y: number = 0;
  unitX: number = 0;
  unitY: number = 0;

  fromDirection(direction: Directions) {
    [this.x, this.y] = [this.unitX, this.unitY] = DirectionMappings.get(direction)!;

    return this;
  }

  fromVelocity(tracker: PointerTracker, pointerId: number) {
    this.x = tracker.getVelocityX(pointerId);
    this.y = tracker.getVelocityY(pointerId);

    const minimalVelocity = 1;
    const isMagnitudeSufficient = this.magnitude > minimalVelocity;

    this.unitX = isMagnitudeSufficient ? this.x / this.magnitude : 0;
    this.unitY = isMagnitudeSufficient ? this.y / this.magnitude : 0;

    return this;
  }

  computeSimilarity(vector: Vector) {
    return this.unitX * vector.unitX + this.unitY * vector.unitY;
  }

  isSimilar(vector: Vector, threshold: number) {
    return this.computeSimilarity(vector) > threshold;
  }

  get magnitude() {
    return Math.hypot(this.x, this.y);
  }
}

const DirectionMappings = new Map<Directions, number[]>([
  [Directions.LEFT, [-1, 0]],
  [Directions.RIGHT, [1, 0]],
  [Directions.UP, [0, -1]],
  [Directions.DOWN, [0, 1]],
]);

export const DirectionToVectorMappings = new Map<Directions, Vector>(
  Object.values(Directions).map((direction) => [
    direction,
    new Vector().fromDirection(direction),
  ])
);
