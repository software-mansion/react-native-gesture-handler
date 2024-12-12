import { AdaptedEvent, EventTypes } from '../interfaces';
import PointerTracker from '../tools/PointerTracker';

export interface RotationGestureListener {
  onRotationBegin: (detector: RotationGestureDetector) => boolean;
  onRotation: (detector: RotationGestureDetector) => boolean;
  onRotationEnd: (detector: RotationGestureDetector) => void;
}

export default class RotationGestureDetector
  implements RotationGestureListener
{
  onRotationBegin: (detector: RotationGestureDetector) => boolean;
  onRotation: (detector: RotationGestureDetector) => boolean;
  onRotationEnd: (detector: RotationGestureDetector) => void;

  private currentTime = 0;
  private previousTime = 0;

  private previousAngle = 0;
  private _rotation = 0;

  private _anchorX = 0;
  private _anchorY = 0;

  private isInProgress = false;

  private keyPointers: number[] = [NaN, NaN];

  constructor(callbacks: RotationGestureListener) {
    this.onRotationBegin = callbacks.onRotationBegin;
    this.onRotation = callbacks.onRotation;
    this.onRotationEnd = callbacks.onRotationEnd;
  }

  private updateCurrent(event: AdaptedEvent, tracker: PointerTracker): void {
    this.previousTime = this.currentTime;
    this.currentTime = event.time;

    const [firstPointerID, secondPointerID] = this.keyPointers;

    const firstPointerCoords = tracker.getLastAbsoluteCoords(firstPointerID);
    const secondPointerCoords = tracker.getLastAbsoluteCoords(secondPointerID);

    const vectorX: number = secondPointerCoords.x - firstPointerCoords.x;
    const vectorY: number = secondPointerCoords.y - firstPointerCoords.y;

    this._anchorX = (firstPointerCoords.x + secondPointerCoords.x) / 2;
    this._anchorY = (firstPointerCoords.y + secondPointerCoords.y) / 2;

    // Angle diff should be positive when rotating in clockwise direction
    const angle: number = -Math.atan2(vectorY, vectorX);

    this._rotation = Number.isNaN(this.previousAngle)
      ? 0
      : this.previousAngle - angle;

    this.previousAngle = angle;

    if (this.rotation > Math.PI) {
      this._rotation -= Math.PI;
    } else if (this.rotation < -Math.PI) {
      this._rotation += Math.PI;
    }

    if (this.rotation > Math.PI / 2) {
      this._rotation -= Math.PI;
    } else if (this.rotation < -Math.PI / 2) {
      this._rotation += Math.PI;
    }
  }

  private finish(): void {
    if (!this.isInProgress) {
      return;
    }

    this.isInProgress = false;
    this.keyPointers = [NaN, NaN];
    this.onRotationEnd(this);
  }

  private setKeyPointers(tracker: PointerTracker): void {
    if (this.keyPointers[0] && this.keyPointers[1]) {
      return;
    }

    const pointerIDs: IterableIterator<number> = tracker.trackedPointers.keys();

    this.keyPointers[0] = pointerIDs.next().value as number;
    this.keyPointers[1] = pointerIDs.next().value as number;
  }

  public onTouchEvent(event: AdaptedEvent, tracker: PointerTracker): boolean {
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
        this.onRotation(this);

        break;

      case EventTypes.ADDITIONAL_POINTER_UP:
        if (!this.isInProgress) {
          break;
        }

        if (this.keyPointers.indexOf(event.pointerId) >= 0) {
          this.finish();
        }

        break;

      case EventTypes.UP:
        if (this.isInProgress) {
          this.finish();
        }
        break;
    }

    return true;
  }

  public reset(): void {
    this.keyPointers = [NaN, NaN];
    this.isInProgress = false;
  }

  public get anchorX() {
    return this._anchorX;
  }

  public get anchorY() {
    return this._anchorY;
  }

  public get rotation() {
    return this._rotation;
  }

  public get timeDelta() {
    return this.currentTime + this.previousTime;
  }
}
