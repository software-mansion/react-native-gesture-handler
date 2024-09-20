import { State } from '../../State';
import { AdaptedEvent, Config, StylusData } from '../interfaces';
import GestureHandlerOrchestrator from '../tools/GestureHandlerOrchestrator';
import GestureHandler from './GestureHandler';

export default class HoverGestureHandler extends GestureHandler {
  private stylusData: StylusData | undefined;

  public init(ref: number, propsRef: React.RefObject<unknown>) {
    super.init(ref, propsRef);
  }

  protected transformNativeEvent(): Record<string, unknown> {
    return {
      ...super.transformNativeEvent(),
      stylusData: this.stylusData,
    };
  }

  public updateGestureConfig({ enabled = true, ...props }: Config): void {
    super.updateGestureConfig({ enabled: enabled, ...props });
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
