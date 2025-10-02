import { AdaptedEvent, GestureHandlerName } from '../interfaces';
import { GestureHandlerDelegate } from '../tools/GestureHandlerDelegate';
import GestureHandler from './GestureHandler';
import IGestureHandler from './IGestureHandler';

export default class ManualGestureHandler extends GestureHandler {
  public constructor(
    delegate: GestureHandlerDelegate<unknown, IGestureHandler>
  ) {
    super(delegate);
    this.name = GestureHandlerName.Manual;
  }

  protected override onPointerDown(event: AdaptedEvent): void {
    this.tracker.addToTracker(event);
    super.onPointerDown(event);
    this.begin();

    this.tryToSendTouchEvent(event);
  }

  protected override onPointerAdd(event: AdaptedEvent): void {
    this.tracker.addToTracker(event);
    super.onPointerAdd(event);
  }

  protected override onPointerMove(event: AdaptedEvent): void {
    this.tracker.track(event);
    super.onPointerMove(event);
  }

  protected override onPointerOutOfBounds(event: AdaptedEvent): void {
    this.tracker.track(event);
    super.onPointerOutOfBounds(event);
  }

  protected override onPointerUp(event: AdaptedEvent): void {
    super.onPointerUp(event);
    this.tracker.removeFromTracker(event.pointerId);
  }

  protected override onPointerRemove(event: AdaptedEvent): void {
    super.onPointerRemove(event);
    this.tracker.removeFromTracker(event.pointerId);
  }
}
