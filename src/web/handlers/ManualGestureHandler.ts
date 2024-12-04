import { AdaptedEvent } from '../interfaces';
import GestureHandler from './GestureHandler';

export default class ManualGestureHandler extends GestureHandler {
  protected onPointerDown(event: AdaptedEvent): void {
    this.tracker.addToTracker(event);
    super.onPointerDown(event);
    this.begin();

    this.tryToSendTouchEvent(event);
  }

  protected onPointerAdd(event: AdaptedEvent): void {
    this.tracker.addToTracker(event);
    super.onPointerAdd(event);
  }

  protected onPointerMove(event: AdaptedEvent): void {
    this.tracker.track(event);
    super.onPointerMove(event);
  }

  protected onPointerOutOfBounds(event: AdaptedEvent): void {
    this.tracker.track(event);
    super.onPointerOutOfBounds(event);
  }

  protected onPointerUp(event: AdaptedEvent): void {
    super.onPointerUp(event);
    this.tracker.removeFromTracker(event.pointerId);
  }

  protected onPointerRemove(event: AdaptedEvent): void {
    super.onPointerRemove(event);
    this.tracker.removeFromTracker(event.pointerId);
  }
}
