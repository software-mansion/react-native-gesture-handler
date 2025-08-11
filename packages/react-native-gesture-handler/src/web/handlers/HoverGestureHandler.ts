import { State } from '../../State';
import { AdaptedEvent, StylusData } from '../interfaces';
import GestureHandlerOrchestrator from '../tools/GestureHandlerOrchestrator';
import GestureHandler from './GestureHandler';

export default class HoverGestureHandler extends GestureHandler {
  private stylusData: StylusData | undefined;

  protected override transformNativeEvent(): Record<string, unknown> {
    return {
      ...super.transformNativeEvent(),
      stylusData: this.stylusData,
    };
  }

  protected override onPointerMoveOver(event: AdaptedEvent): void {
    GestureHandlerOrchestrator.instance.recordHandlerIfNotPresent(this);

    this.tracker.addToTracker(event);
    this.stylusData = event.stylusData;
    super.onPointerMoveOver(event);

    if (this.state === State.UNDETERMINED) {
      this.begin();
      this.activate();
    }
  }

  protected override onPointerMoveOut(event: AdaptedEvent): void {
    this.tracker.removeFromTracker(event.pointerId);
    this.stylusData = event.stylusData;

    super.onPointerMoveOut(event);

    this.end();
  }

  protected override onPointerMove(event: AdaptedEvent): void {
    this.tracker.track(event);
    this.stylusData = event.stylusData;

    super.onPointerMove(event);
  }

  protected override onPointerCancel(event: AdaptedEvent): void {
    super.onPointerCancel(event);
    this.reset();
  }
}
