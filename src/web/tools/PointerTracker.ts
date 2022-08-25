import { AdaptedPointerEvent } from '../interfaces';

interface TrackerElement {
  lastX: number;
  lastY: number;

  timeStamp: number;

  velocityX: number;
  velocityY: number;
}

const VELOCITY_FACTOR = 0.2;

export default class PointerTracker {
  private trackedPointers: Map<number, TrackerElement> = new Map<
    number,
    TrackerElement
  >();

  public addToTracker(event: AdaptedPointerEvent): void {
    if (this.trackedPointers.has(event.pointerId)) {
      return;
    }

    const newElement: TrackerElement = {
      lastX: event.x,
      lastY: event.y,
      timeStamp: event.time,
      velocityX: 0,
      velocityY: 0,
    };

    this.trackedPointers.set(event.pointerId, newElement);
  }

  public removeFromTracker(pointerId: number): void {
    this.trackedPointers.delete(pointerId);
  }

  public track(event: AdaptedPointerEvent): void {
    const element: TrackerElement = this.trackedPointers.get(
      event.pointerId
    ) as TrackerElement;

    if (!element) {
      return;
    }

    const dx = event.x - element.lastX;
    const dy = event.y - element.lastY;
    const dt = event.time - element.timeStamp;

    element.velocityX = (dx / dt) * 1000 * VELOCITY_FACTOR;
    element.velocityY = (dy / dt) * 1000 * VELOCITY_FACTOR;

    element.lastX = event.x;
    element.lastY = event.y;

    this.trackedPointers.set(event.pointerId, element);
  }

  public getVelocityX(pointerId: number): number {
    return this.trackedPointers.get(pointerId)?.velocityX as number;
  }
  public getVelocityY(pointerId: number): number {
    return this.trackedPointers.get(pointerId)?.velocityY as number;
  }
  public getLastX(pointerId: number): number {
    return this.trackedPointers.get(pointerId)?.lastX as number;
  }
  public getLastY(pointerId: number): number {
    return this.trackedPointers.get(pointerId)?.lastY as number;
  }
  public getLastAvgX(): number {
    return this.getSumX() / this.trackedPointers.size;
  }
  public getLastAvgY(): number {
    return this.getSumY() / this.trackedPointers.size;
  }
  public getSumX(ignoredPointer?: number): number {
    let sumX = 0;

    this.trackedPointers.forEach((value, key) => {
      if (key !== ignoredPointer) {
        sumX += value.lastX;
      }
    });

    return sumX;
  }
  public getSumY(ignoredPointer?: number): number {
    let sumY = 0;

    this.trackedPointers.forEach((value, key) => {
      if (key !== ignoredPointer) {
        sumY += value.lastY;
      }
    });

    return sumY;
  }
  public getTrackedPointersCount(): number {
    return this.trackedPointers.size;
  }
  public getTrackedPointersID(): number[] {
    const keys: number[] = [];

    this.trackedPointers.forEach((_value, key) => {
      keys.push(key);
    });

    return keys;
  }

  public getData(): Map<number, TrackerElement> {
    return this.trackedPointers;
  }

  public resetTracker(): void {
    this.trackedPointers.clear();
  }

  public static shareCommonPointers(
    stPointers: number[],
    ndPointers: number[]
  ): boolean {
    return stPointers.some((pointerId) => ndPointers.includes(pointerId));
  }
}
