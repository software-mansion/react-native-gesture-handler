import { State } from '../../State';
import { AdaptedEvent, Config, StylusData } from '../interfaces';
import GestureHandlerOrchestrator from '../tools/GestureHandlerOrchestrator';
import GestureHandler from './GestureHandler';

export default class HoverGestureHandler extends GestureHandler {
  private _stylusData: StylusData | undefined;

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

    this.pointerTracker.addToTracker(event);
    this.stylusData = event.stylusData;
    super.onPointerMoveOver(event);

    if (this.state === State.UNDETERMINED) {
      this.begin();
      this.activate();
    }
  }

  protected onPointerMoveOut(event: AdaptedEvent): void {
    this.pointerTracker.removeFromTracker(event.pointerId);
    this.stylusData = event.stylusData;

    super.onPointerMoveOut(event);

    this.end();
  }

  protected onPointerMove(event: AdaptedEvent): void {
    this.pointerTracker.track(event);
    this.stylusData = event.stylusData;

    super.onPointerMove(event);
  }

  protected onPointerCancel(event: AdaptedEvent): void {
    super.onPointerCancel(event);
    this.reset();
  }

  public get stylusData() {
    return this._stylusData;
  }
  public set stylusData(value: StylusData | undefined) {
    this._stylusData = value;
  }
}
