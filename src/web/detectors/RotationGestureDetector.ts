import { EventTypes, GHEvent } from '../tools/EventManager';
import Tracker from '../tools/Tracker';

export interface RotationGestureListener {
  onRotationBegin: (detector: RotationGestureDetector) => boolean;
  onRotation: (detector: RotationGestureDetector, event: GHEvent) => boolean;
  onRotationEnd: (detector: RotationGestureDetector, event: GHEvent) => void;
}

export default class RotationGestureDetector
  implements RotationGestureListener {
  onRotationBegin: (detector: RotationGestureDetector) => boolean;
  onRotation: (detector: RotationGestureDetector, event: GHEvent) => boolean;
  onRotationEnd: (detector: RotationGestureDetector, event: GHEvent) => void;

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

  private updateCurrent(event: GHEvent, tracker: Tracker): void {
    this.previousTime = this.currentTime;
    this.currentTime = event.time;

    const pointerIDs: IterableIterator<number> = tracker.getData().keys();

    const stPointerID: number = pointerIDs.next().value as number;
    const ndPointerID: number = pointerIDs.next().value as number;

    const stPointerX: number = tracker.getLastX(stPointerID);
    const stPointerY: number = tracker.getLastY(stPointerID);
    const ndPointerX: number = tracker.getLastX(ndPointerID);
    const ndPointerY: number = tracker.getLastY(ndPointerID);

    const vectorX: number = ndPointerX - stPointerX;
    const vectorY: number = ndPointerY - stPointerY;

    this.anchorX = (stPointerX + ndPointerX) * 0.5;
    this.anchorY = (stPointerY + ndPointerY) * 0.5;

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

  private finish(event: GHEvent): void {
    if (!this.isInProgress) return;

    this.isInProgress = false;
    this.keyPointers = [NaN, NaN];
    this.onRotationEnd(this, event);
  }

  private setKeyPointers(tracker: Tracker): void {
    if (this.keyPointers[0] && this.keyPointers[1]) return;

    const pointerIDs: IterableIterator<number> = tracker.getData().keys();

    this.keyPointers[0] = pointerIDs.next().value as number;
    this.keyPointers[1] = pointerIDs.next().value as number;
  }

  public onTouchEvent(event: GHEvent, tracker: Tracker): boolean {
    switch (event.eventType) {
      case EventTypes.DOWN:
        this.isInProgress = false;
        break;

      case EventTypes.POINTER_DOWN:
        if (this.isInProgress) break;

        this.isInProgress = true;

        this.previousTime = event.time;
        this.previousAngle = NaN;

        this.setKeyPointers(tracker);

        this.updateCurrent(event, tracker);
        this.onRotationBegin(this);
        break;

      case EventTypes.MOVE:
        if (!this.isInProgress) break;

        this.updateCurrent(event, tracker);
        this.onRotation(this, event);

        break;

      case EventTypes.POINTER_UP:
        if (!this.isInProgress) break;

        if (this.keyPointers.indexOf(event.pointerId) >= 0) this.finish(event);

        break;

      case EventTypes.UP:
        this.finish(event);
        break;
    }

    return true;
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
