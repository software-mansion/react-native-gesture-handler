import { AdaptedPointerEvent, EventTypes } from '../interfaces';
import PointerTracker from '../tools/PointerTracker';

export interface RotationGestureListener {
  onRotationBegin: (detector: RotationGestureDetector) => boolean;
  onRotation: (
    detector: RotationGestureDetector,
    event: AdaptedPointerEvent
  ) => boolean;
  onRotationEnd: (
    detector: RotationGestureDetector,
    event: AdaptedPointerEvent
  ) => void;
}

export default class RotationGestureDetector
  implements RotationGestureListener {
  onRotationBegin: (detector: RotationGestureDetector) => boolean;
  onRotation: (
    detector: RotationGestureDetector,
    event: AdaptedPointerEvent
  ) => boolean;
  onRotationEnd: (
    detector: RotationGestureDetector,
    event: AdaptedPointerEvent
  ) => void;

  private currentTime = 0;
  private previousTime = 0;

  private previousAngle = 0;
  private rotation = 0;

  private anchorX = 0;
  private anchorY = 0;

  private isInProgress = false;

  private keyPointers: number[] = [NaN, NaN];

  constructor(callbacks: RotationGestureListener) {
    this.onRotationBegin = callbacks.onRotationBegin;
    this.onRotation = callbacks.onRotation;
    this.onRotationEnd = callbacks.onRotationEnd;
  }

  private updateCurrent(
    event: AdaptedPointerEvent,
    tracker: PointerTracker
  ): void {
    this.previousTime = this.currentTime;
    this.currentTime = event.time;

    const [firstPointerID, secondPointerID] = this.keyPointers;

    const firstPointerX: number = tracker.getLastX(firstPointerID);
    const firstPointerY: number = tracker.getLastY(firstPointerID);
    const secondPointerX: number = tracker.getLastX(secondPointerID);
    const secondPointerY: number = tracker.getLastY(secondPointerID);

    const vectorX: number = secondPointerX - firstPointerX;
    const vectorY: number = secondPointerY - firstPointerY;

    this.anchorX = (firstPointerX + secondPointerX) / 2;
    this.anchorY = (firstPointerY + secondPointerY) / 2;

    //Angle diff should be positive when rotating in clockwise direction
    const angle: number = -Math.atan2(vectorY, vectorX);
    this.rotation = Number.isNaN(this.previousAngle)
      ? 0
      : this.previousAngle - angle;

    this.previousAngle = angle;

    if (this.rotation > Math.PI) {
      this.rotation -= Math.PI;
    } else if (this.rotation < -Math.PI) {
      this.rotation += Math.PI;
    }

    if (this.rotation > Math.PI / 2) {
      this.rotation -= Math.PI;
    } else if (this.rotation < -Math.PI / 2) {
      this.rotation += Math.PI;
    }
  }

  private finish(event: AdaptedPointerEvent): void {
    if (!this.isInProgress) {
      return;
    }

    this.isInProgress = false;
    this.keyPointers = [NaN, NaN];
    this.onRotationEnd(this, event);
  }

  private setKeyPointers(tracker: PointerTracker): void {
    if (this.keyPointers[0] && this.keyPointers[1]) {
      return;
    }

    const pointerIDs: IterableIterator<number> = tracker.getData().keys();

    this.keyPointers[0] = pointerIDs.next().value as number;
    this.keyPointers[1] = pointerIDs.next().value as number;
  }

  public onTouchEvent(
    event: AdaptedPointerEvent,
    tracker: PointerTracker
  ): boolean {
    this.adaptEvent(event, tracker);

    switch (event.eventType) {
      case EventTypes.DOWN:
        this.isInProgress = false;
        break;

      case EventTypes.ADDITIONAL_POINTER_DOWN:
        if (this.isInProgress) {
          break;
        }

        this.isInProgress = true;

        this.previousTime = event.time;
        this.previousAngle = NaN;

        this.setKeyPointers(tracker);

        this.updateCurrent(event, tracker);
        this.onRotationBegin(this);
        break;

      case EventTypes.MOVE:
        if (!this.isInProgress) {
          break;
        }

        this.updateCurrent(event, tracker);
        this.onRotation(this, event);

        break;

      case EventTypes.ADDITIONAL_POINTER_UP:
        if (!this.isInProgress) {
          break;
        }

        if (this.keyPointers.indexOf(event.pointerId) >= 0) {
          this.finish(event);
        }

        break;

      case EventTypes.UP:
        this.finish(event);
        break;
    }

    return true;
  }

  private adaptEvent(
    event: AdaptedPointerEvent,
    tracker: PointerTracker
  ): void {
    if (
      tracker.getTrackedPointersCount() &&
      event.eventType === EventTypes.DOWN
    ) {
      event.eventType = EventTypes.ADDITIONAL_POINTER_DOWN;
    }

    if (
      tracker.getTrackedPointersCount() > 1 &&
      event.eventType === EventTypes.UP
    ) {
      event.eventType = EventTypes.ADDITIONAL_POINTER_UP;
    }
  }

  public getTimeDelta(): number {
    return this.currentTime + this.previousTime;
  }

  public getAnchorX(): number {
    return this.anchorX;
  }

  public getAnchorY(): number {
    return this.anchorY;
  }

  public getRotation(): number {
    return this.rotation;
  }
}
