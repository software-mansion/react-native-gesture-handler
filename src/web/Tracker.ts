import { GHEvent } from './EventManager';

interface TrackerElement {
  lastX: number;
  lastY: number;

  velocityX: number;
  velocityY: number;
}

class Tracker {
  private trackedPointers: Map<number, TrackerElement> = new Map<
    number,
    TrackerElement
  >();

  public addToTracker(pointer: GHEvent): void {
    if (this.trackedPointers.has(pointer.pointerId)) return;

    const emptyElement: TrackerElement = {
      lastX: pointer.x,
      lastY: pointer.y,
      velocityX: 0,
      velocityY: 0,
    };

    this.trackedPointers.set(pointer.pointerId, emptyElement);
  }

  public removeFromTracker(pointerId: number): void {
    this.trackedPointers.delete(pointerId);
  }

  public track(event: GHEvent): void {
    const element: TrackerElement = this.trackedPointers.get(
      event.pointerId
    ) as TrackerElement;

    element.velocityX = Math.abs(event.x - element.lastX);
    element.velocityY = Math.abs(event.y - element.lastY);

    element.lastX = event.x;
    element.lastY = event.y;

    this.trackedPointers.set(event.pointerId, element);

    return;
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
    let sumX = 0;

    this.trackedPointers.forEach((element) => {
      sumX += element.lastX;
    });

    return sumX / this.trackedPointers.size;
  }
  public getLastAvgY(): number {
    let sumY = 0;

    this.trackedPointers.forEach((element) => {
      sumY += element.lastY;
    });

    return sumY / this.trackedPointers.size;
  }
  public getTrackedPointersNumber(): number {
    return this.trackedPointers.size;
  }
  public resetTracker(): void {
    this.trackedPointers.clear();
  }
}

export default Tracker;
