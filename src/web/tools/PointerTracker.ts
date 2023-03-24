import { PixelRatio } from 'react-native';
import { AdaptedEvent } from '../interfaces';
import CircularBuffer from './CircularBuffer';

export interface TrackerElement {
  lastX: number;
  lastY: number;

  timeStamp: number;

  velocityX: number;
  velocityY: number;
}

class VelocityTracker {
  private buffer: CircularBuffer<AdaptedEvent>;

  constructor() {
    this.buffer = new CircularBuffer<AdaptedEvent>(5);
  }

  public add(event: AdaptedEvent): void {
    this.buffer.push(event);
  }

  public getVelocity(): [number, number] {
    if (this.buffer.size < 2) {
      return [0, 0];
    }

    // I don't know, feels about right
    const ratio = PixelRatio.get() > 1 ? PixelRatio.get() - 0.5 : 1.5;

    let changeX = 0;
    let changeY = 0;
    let startTime = this.buffer.get(0).time;
    let endTime = this.buffer.get(0).time;

    for (let i = 0; i < this.buffer.size - 1; i++) {
      const current = this.buffer.get(i);
      const next = this.buffer.get(i + 1);

      changeX += next.x - current.x;
      changeY += next.y - current.y;

      startTime = Math.min(current.time, next.time, startTime);
      endTime = Math.max(current.time, next.time, endTime);
    }

    const dt = (endTime - startTime) / 1000; // to seconds
    const velocityX = changeX / dt / ratio;
    const velocityY = changeY / dt / ratio;

    return [velocityX, velocityY];
  }

  public reset(): void {
    this.buffer.clear();
  }
}

const MAX_POINTERS = 20;

export default class PointerTracker {
  private velocityTracker = new VelocityTracker();
  private trackedPointers: Map<number, TrackerElement> = new Map<
    number,
    TrackerElement
  >();

  private touchEventsIds: Map<number, number> = new Map<number, number>();

  private lastMovedPointerId: number;

  private cachedAverages: { x: number; y: number } = { x: 0, y: 0 };

  public constructor() {
    this.lastMovedPointerId = NaN;

    for (let i = 0; i < MAX_POINTERS; ++i) {
      this.touchEventsIds.set(i, NaN);
    }
  }

  public addToTracker(event: AdaptedEvent): void {
    if (this.trackedPointers.has(event.pointerId)) {
      return;
    }

    this.lastMovedPointerId = event.pointerId;

    const newElement: TrackerElement = {
      lastX: event.x,
      lastY: event.y,
      timeStamp: event.time,
      velocityX: 0,
      velocityY: 0,
    };

    this.trackedPointers.set(event.pointerId, newElement);
    this.mapTouchEventId(event.pointerId);

    this.cachedAverages = {
      x: this.getLastAvgX(),
      y: this.getLastAvgY(),
    };
  }

  public removeFromTracker(pointerId: number): void {
    this.trackedPointers.delete(pointerId);
    this.removeMappedTouchId(pointerId);
  }

  public track(event: AdaptedEvent): void {
    const element: TrackerElement = this.trackedPointers.get(
      event.pointerId
    ) as TrackerElement;

    if (!element) {
      return;
    }

    this.lastMovedPointerId = event.pointerId;

    this.velocityTracker.add(event);
    const [velocityX, velocityY] = this.velocityTracker.getVelocity();

    element.velocityX = velocityX;
    element.velocityY = velocityY;

    element.lastX = event.x;
    element.lastY = event.y;

    this.trackedPointers.set(event.pointerId, element);

    const avgX: number = this.getLastAvgX();
    const avgY: number = this.getLastAvgY();

    this.cachedAverages = {
      x: avgX,
      y: avgY,
    };
  }

  //Mapping TouchEvents ID
  private mapTouchEventId(id: number): void {
    for (const [mappedId, touchId] of this.touchEventsIds) {
      if (isNaN(touchId)) {
        this.touchEventsIds.set(mappedId, id);
        break;
      }
    }
  }

  private removeMappedTouchId(id: number): void {
    const mappedId: number = this.getMappedTouchEventId(id);
    if (!isNaN(mappedId)) {
      this.touchEventsIds.set(mappedId, NaN);
    }
  }

  public getMappedTouchEventId(touchEventId: number): number {
    for (const [key, value] of this.touchEventsIds.entries()) {
      if (value === touchEventId) {
        return key;
      }
    }

    return NaN;
  }

  public getVelocityX(pointerId: number): number {
    return this.trackedPointers.get(pointerId)?.velocityX as number;
  }
  public getVelocityY(pointerId: number): number {
    return this.trackedPointers.get(pointerId)?.velocityY as number;
  }

  /**
   * Returns X coordinate of last moved pointer
   */
  public getLastX(): number;

  /**
   *
   * @param pointerId
   * Returns X coordinate of given pointer
   */
  // eslint-disable-next-line @typescript-eslint/unified-signatures
  public getLastX(pointerId: number): number;

  public getLastX(pointerId?: number): number {
    if (pointerId !== undefined) {
      return this.trackedPointers.get(pointerId)?.lastX as number;
    } else {
      return this.trackedPointers.get(this.lastMovedPointerId)?.lastX as number;
    }
  }

  /**
   * Returns Y coordinate of last moved pointer
   */
  public getLastY(): number;

  /**
   *
   * @param pointerId
   * Returns Y coordinate of given pointer
   */
  // eslint-disable-next-line @typescript-eslint/unified-signatures
  public getLastY(pointerId: number): number;

  public getLastY(pointerId?: number): number {
    if (pointerId !== undefined) {
      return this.trackedPointers.get(pointerId)?.lastY as number;
    } else {
      return this.trackedPointers.get(this.lastMovedPointerId)?.lastY as number;
    }
  }

  // Some handlers use these methods to send average values in native event.
  // This may happen when pointers have already been removed from tracker (i.e. pointerup event).
  // In situation when NaN would be sent as a response, we return cached value.
  // That prevents handlers from crashing
  public getLastAvgX(): number {
    const avgX: number = this.getSumX() / this.trackedPointers.size;
    return isNaN(avgX) ? this.cachedAverages.x : avgX;
  }
  public getLastAvgY(): number {
    const avgY: number = this.getSumY() / this.trackedPointers.size;
    return isNaN(avgY) ? this.cachedAverages.y : avgY;
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
    this.velocityTracker.reset();
    this.trackedPointers.clear();
    this.lastMovedPointerId = NaN;

    for (let i = 0; i < MAX_POINTERS; ++i) {
      this.touchEventsIds.set(i, NaN);
    }
  }

  public static shareCommonPointers(
    stPointers: number[],
    ndPointers: number[]
  ): boolean {
    return stPointers.some((pointerId) => ndPointers.includes(pointerId));
  }
}
