import { State } from '../../State';
import { AdaptedEvent, StylusData } from '../interfaces';
import GestureHandlerOrchestrator from '../tools/GestureHandlerOrchestrator';
import GestureHandler from './GestureHandler';

export default class HoverGestureHandler extends GestureHandler {
  private stylusData: StylusData | undefined;

  protected transformNativeEvent(): Record<string, unknown> {
    return {
      ...super.transformNativeEvent(),
      stylusData: this.stylusData,
    };
  }

  protected onPointerMoveOver(event: AdaptedEvent): void {
    GestureHandlerOrchestrator.getInstance().recordHandlerIfNotPresent(this);

    this.tracker.addToTracker(event);
    this.stylusData = event.stylusData;
    super.onPointerMoveOver(event);

    if (this.getState() === State.UNDETERMINED) {
      this.begin();
      this.activate();
    }
  }

  protected onPointerMoveOut(event: AdaptedEvent): void {
    this.tracker.removeFromTracker(event.pointerId);
    this.stylusData = event.stylusData;

    super.onPointerMoveOut(event);

    this.end();
  }

  protected onPointerMove(event: AdaptedEvent): void {
    this.tracker.track(event);
    this.stylusData = event.stylusData;

    super.onPointerMove(event);
  }

  protected onPointerCancel(event: AdaptedEvent): void {
    super.onPointerCancel(event);
    this.reset();
  }
}
