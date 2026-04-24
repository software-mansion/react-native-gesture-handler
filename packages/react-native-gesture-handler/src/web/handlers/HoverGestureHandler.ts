import type { StylusData } from '../../handlers/gestureHandlerCommon';
import { State } from '../../State';
import { SingleGestureName } from '../../v3/types';
import type { AdaptedEvent } from '../interfaces';
import type { GestureHandlerDelegate } from '../tools/GestureHandlerDelegate';
import GestureHandlerOrchestrator from '../tools/GestureHandlerOrchestrator';
import GestureHandler from './GestureHandler';
import type IGestureHandler from './IGestureHandler';

export default class HoverGestureHandler extends GestureHandler {
  private stylusData: StylusData | undefined;

  public constructor(
    delegate: GestureHandlerDelegate<unknown, IGestureHandler>
  ) {
    super(delegate);
    this.name = SingleGestureName.Hover;
  }

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
